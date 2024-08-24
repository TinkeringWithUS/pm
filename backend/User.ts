import { PrismaClient } from "@prisma/client";
import { chatRoom } from "../shared/networkInterface";
import { RealTimeDoc } from "./RealTimeDoc";

import { privateDecrypt, randomBytes } from "crypto";
import { compareSync, genSaltSync, hashSync } from "bcrypt";
import { couldStartTrivia } from "typescript";

const NUM_MS_IN_SECOND = 1000;

const secondsToMs = (seconds: number) => {
  return seconds * NUM_MS_IN_SECOND;
};

// TODO: make this dynamic, e.g. 
// client sends heartbeat to continue 
// the login session, otherwise, kick out
// let's say one hour ~ 60 minutes
// 60 minutes = 60 (secs/min) * 60 (mins) = 3600 secs
const LOGIN_LIMIT_IN_SECONDS = 3600;

const allDocuments: RealTimeDoc[] = [];

const TOKEN_LENGTH = 20;

function generateSessionToken() {
  return randomBytes(TOKEN_LENGTH).toString("hex");
}

type userRecord = {
  id?: number,
  username: string,
  passwordHash: string,
  salt: string
  profilePictureFileName: string,
  activeSessionToken: string,
  loginTime: string,
};

const saltRounds = 12;

class User {
  private username: string;
  private passwordHash: string = "";
  private salt: string = "";
  private loginTime: Date;
  private activeSessionToken: string | null;

  private chatRooms: chatRoom[];

  constructor(username: string, password?: string, passwordHash?: string, loginTime?: Date,
    activeSessionToken?: string, chatRooms?: chatRoom[]) {
    this.username = username;

    this.loginTime = loginTime ?? new Date();
    this.activeSessionToken = activeSessionToken ?? null;
    this.chatRooms = chatRooms ?? [];

    this.salt = genSaltSync(saltRounds);
    if(password) {
      this.passwordHash = hashSync(password, this.salt);
    } else if (passwordHash) {
      this.passwordHash = passwordHash;
    }

    console.log("constructor, password: " + this.passwordHash);
  }

  public async registerUser(dbClient: PrismaClient) {
    this.activeSessionToken = generateSessionToken();

    await dbClient.user.update({
      where: {
        username: this.username
      },
      data: {
        activeSessionToken: this.activeSessionToken
      }
    });

    return this.activeSessionToken;
  }

  public isLoggedIn(sessionToken: string): boolean {
    if (this.activeSessionToken && this.activeSessionToken !== sessionToken || !this.loginTime) {
      return false;
    }

    // FIXME: Refresh the date when successfully logged in

    return (Date.now() - new Date(this.loginTime).getTime()) > secondsToMs(LOGIN_LIMIT_IN_SECONDS);
  }

  public async signIn(password: string, dbClient: PrismaClient) {
    const signInHash = hashSync(password, this.salt);
    const isSameHash = compareSync(password, this.passwordHash);

    // console.log("in user.signin, this passwordHash: " + this.passwordHash + ". signinHash: " + signInHash);
    console.log("signin hash: " + signInHash);
    console.log("this hash: " + this.passwordHash);
    console.log("passed in password: " + password);
    console.log("this.username: " + this.username + ". this password hash: " + this.passwordHash);
    console.log("is same hash: " + isSameHash);
    if(compareSync(password, this.passwordHash)) {
      // TODO: ensure session token will be unique
      this.activeSessionToken = generateSessionToken();
      while (await dbClient.user.findFirst({
        where: {
          activeSessionToken: this.activeSessionToken
        }
      })) {
        this.activeSessionToken = generateSessionToken();
      }

      this.loginTime = new Date();

      await dbClient.user.update({
        where: {
          username: this.username
        },
        data: {
          loginTime: this.loginTime.toISOString()
        }
      });

      return this.activeSessionToken;
    }
    return "";
  }

  public async joinChatRoom(roomId: number, dbClient: PrismaClient) {

    const user = await dbClient.user.findFirst({
      where: {
        username: this.username
      }
    });

    // Try to find if this chat room even exists, if not, return false
    const chatRoom = await dbClient.chatRoom.findFirst({
      where: {
        id: roomId
      }
    });

    if(!chatRoom || !user) {
      console.error("Can't find Either this current user or chat room in database");
      return false;
    }

    const userJoinedRoomRecord = await dbClient.userJoinedRooms.upsert({
      where: {
        userJoinedRoomId: {
          userId: user.id,
          joinedRoomId: roomId
        } 
      },
      create: {
        userId: user.id,
        joinedRoomId: roomId
      },
      update: {}
    });

    // TODO: add error handling here if the update fails
    // const userJoinedRoomRecord = await dbClient.userJoinedRooms.upsert({
    //   where: {
    //     userJoinedRoomId: {
    //       userId: user.id,
    //       joinedRoomId: roomId
    //     }
    //   }, 
    //   create: {
    //     userId: user.id,
    //     joinedRoomId: roomId
    //   }, 
    //   update: { }
    // });

    if(!userJoinedRoomRecord) {
      return false;
    }

    const joinedRoom: chatRoom = {
      id: roomId,
      name: chatRoom.name
    };

    this.chatRooms.push(joinedRoom);
    return true;
  }

  // TODO: optimize the number of database queries being performed

  public async getRooms(dbClient: PrismaClient) {
    const userRecord = await dbClient.user.findFirst({
      where: {
        username: this.username
      }
    });

    if (!userRecord) {
      console.error("User not found in database in getRooms");
      return this.chatRooms;
    }

    console.log("getRooms in User.ts. user id: " + userRecord.id);

    const joinedRoomRecords = await dbClient.userJoinedRooms.findMany({
      where: {
        userId: userRecord.id
      }
    });

    // check if anything has changed in chatrooms, if not, 
    // return this.chatrooms (still valid)
    if(joinedRoomRecords.every((chatRoom) => {
      return this.chatRooms.find((chatroom) => {
        if(chatroom.id === chatRoom.joinedRoomId) {
          return true;
        }
      });
    })) {
      return this.chatRooms;
    }

    const chatRoomsRecords = [];
    for (const record of joinedRoomRecords) {
      // look up the room name from the record
      const chatRoomRecord = await dbClient.chatRoom.findFirst({
        where: {
          id: record.joinedRoomId
        }
      });

      if(!chatRoomRecord) {
        console.error("could not find chat room from joined room id: " + record.joinedRoomId);
      } else {
        chatRoomsRecords.push(chatRoomRecord);
      }
    }

    // TODO: this line breaks the entire caching idea
    this.chatRooms = chatRoomsRecords;

    console.log("returning this.chatrooms: " + JSON.stringify(this.chatRooms));

    return this.chatRooms;
  }

  public static isEqual(user: User, otherUser: User) {
    return user.username == otherUser.username &&
      user.passwordHash == otherUser.passwordHash;
  }

  public getRecord() {
    const dbRecord: userRecord = {
      username: this.username,
      salt: this.salt,
      passwordHash: this.passwordHash, // redo
      loginTime: this.loginTime.toString(),
      activeSessionToken: this.activeSessionToken ?? "",
      profilePictureFileName: "",
    };

    return dbRecord;
  }
};

// Returns null if user failed to load, else return new user 
async function loadUser(dbClient: PrismaClient, username: string) {
  const user = await dbClient.user.findFirst({
    where: {
      username: username
    }
  });

  if (!user) {
    return null;
  }

  // go through userJoinedRooms table record = (userId, joinedRoomId)
  // and grab all joinedRoomIds for the User to initialization it 
  // for the in memory structure
  const userToJoinedRooms = await dbClient.userJoinedRooms.findMany({
    where: {
      userId: user.id
    }
  });

  const loginDate = user.loginTime ? new Date(user.loginTime) : undefined;
  const sessionToken = user.activeSessionToken ? user.activeSessionToken : undefined;

  if (userToJoinedRooms) {
    const joinedRooms: chatRoom[] = [];

    for (const userToJoinedRoom of userToJoinedRooms) {
      const chatRoomRecord = await dbClient.chatRoom.findFirst({
        where: {
          id: userToJoinedRoom.joinedRoomId
        }
      });

      // TODO: Rewrite everything to support ids with chatrooms
      if (chatRoomRecord) {
        const joinedChatRoom: chatRoom = {
          id: userToJoinedRoom.joinedRoomId,
          name: chatRoomRecord.name
        };

        joinedRooms.push(joinedChatRoom);
      }
    }

    console.log("User to joined rooms in load: " + JSON.stringify(userToJoinedRooms));

    // FIXME: too many confusing and overlapping variable names
    const joinedChatRooms: chatRoom[] = joinedRooms.map((joinedChatRoom) => {
      const chatRoom: chatRoom = {
        name: joinedChatRoom.name,
        id: joinedChatRoom.id,
      };
      return chatRoom;
    });

    console.log("joined chat rooms in load");
    console.log(JSON.stringify(joinedChatRooms));

    // FIXME: passing in password hash, but constructor is hashing the password
    // so double hashing is stopping verification
    // TODO: move to UserController
    return new User(user.username, undefined, user.passwordHash, loginDate, sessionToken, joinedChatRooms);
  } else {
    return new User(user.username, user.passwordHash, undefined, loginDate, sessionToken);
  }
}

async function loadAllUsers(dbClient: PrismaClient) {
  const userRecord = await dbClient.user.findMany();

  const usernamesToUser = new Map<string, User>();

  console.log("load all users");
  console.log(JSON.stringify(userRecord));

  for (const record of userRecord) {
    const user = await loadUser(dbClient, record.username);

    if (user) {
      usernamesToUser.set(record.username, user);
    }
  }

  console.log("usernames to users. usernames");
  console.log(usernamesToUser.keys());

  return usernamesToUser;
}

// Returns null if user already exists, otherwise returns newly created user.
async function createUniqueUser(username: string, password: string,
  dbClient: PrismaClient, loginTime?: Date, activeSessionToken?: string,
  chatRooms?: chatRoom[]) {
  // perform checks that 1. user doesn't already exists 
  // 2. create user if they don't exist 
  const user = await dbClient.user.findFirst({
    where: {
      username: username
    }
  });

  if (user) {
    return null;
  }

  const newUser = new User(username, password, undefined, loginTime, activeSessionToken, chatRooms);
  const userRecord = newUser.getRecord();

  await dbClient.user.create({
    data: {
      username: userRecord.username,
      passwordHash: userRecord.passwordHash,
      salt: userRecord.salt,
      profilePictureFileName: userRecord.profilePictureFileName,
      activeSessionToken: userRecord.activeSessionToken,
      loginTime: userRecord.loginTime,
    }
  });

  return newUser;
}



export { User, loadAllUsers, createUniqueUser };