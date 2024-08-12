import { Socket } from "socket.io";
import { CHAT_GET_MESSAGE_SIGNAL, CHAT_SEND_MESSAGE_SIGNAL, CHAT_NEW_MESSAGE_SIGNAL, getChatMessages, userMessage, newChatMessage, chatRoom } from "../shared/networkInterface";
import { PrismaClient } from "@prisma/client";
import { usernamesToUsers } from "./AuthRoutes";
import { chatRoomController } from "./ChatHandlers";

// TODO: use a database to store 1. user's chat messages 2. user data (like
// password (use hashing), username, etc.)
// for 1. maybe mongodb? (wanna use a nonsql database) 2. use a sql database (supabase)

// why a class for user message? 
// adding permissions, roles (like moderator, or special roles)
// just for extension
// class UserMessage {
//   private username: string;
//   private body: string;

//   constructor(username: string, body: string) {
//     this.username = username;
//     this.body = body;
//   }

//   getUsername() {
//     return this.username;
//   }

//   getBody() {
//     return this.body;
//   }
// };

// TODO: allow same names because of the id system
class ChatRoom {

  private messages: userMessage[];
  private chatRoomId: number;
  private roomName: string;

  constructor(chatRoomId: number, roomName: string) {
    this.messages = [];
    this.chatRoomId = chatRoomId;
    this.roomName = roomName;
  }

  joinRoom(socket: Socket, username: string, dbClient: PrismaClient) {

    // Problem with this, possible for 
    dbClient.user.findFirst({
      where: {
        username: username
      }
    })
    .then((userRecord) => { return userRecord?.id; })
    .then((userId) => {
      if(userId) {
        // if already joined, no need to join again
        return dbClient.userJoinedRooms.upsert({
          where: {
            userJoinedRoomId: {
              userId: userId,
              joinedRoomId: this.chatRoomId
            }
          },
          create: {
            userId: userId,
            joinedRoomId: this.chatRoomId,
          },
          update: { }
        });
      } else {
        return null;
      }
    });

    socket.join("" + this.chatRoomId);
  }

  leaveRoom(socket: Socket) {
    socket.leave("" + this.chatRoomId);
  }

  sendMessage(senderSocket: Socket, username: string, text: string, dbClient: PrismaClient) {
    const message: userMessage = {
      username: username,
      body: text
    };

    // update database with info, in memory structures will 
    // update fine with this.messages.push, no need to wait for this
    dbClient.user.findFirst({
      where: {
        username: username
      }
    })
    .then((userRecord) => {
      if(userRecord) {
        return userRecord.id; 
      } else {
        return -1;
      }
    })
    .then((userId) => {
      console.log("user id in send message: " + userId);
      if(userId > -1) {
        dbClient.chatMessages.create({
          data: {
            userId: userId,
            username: username,
            roomId: this.chatRoomId,
            roomname: this.roomName,
            body: text,
          }
        })
        .then((chatMessageRecord) => {
          console.log(JSON.stringify(chatMessageRecord));
        });
      }
    });

    this.messages.push(message);

    // no guarantee that socket is in the room
    this.joinRoom(senderSocket, username, dbClient);

    console.log("sender socket rooms: " + JSON.stringify(senderSocket.rooms));
    console.log("send message, username: " + username + ". text: " + text);

    const newMessage: userMessage = {
      username: username,
      body: text
    };

    // senderSocket.to(this.chatRoomId).emit(CHAT_SEND_MESSAGE_SIGNAL, message);
    senderSocket.to("" + this.chatRoomId).emit(CHAT_NEW_MESSAGE_SIGNAL, newMessage);

    console.log("sending chat new message signal with message: " + JSON.stringify(newMessage) + ". chat room id: " + this.chatRoomId)
    console.log("rooms current socket is in: " + JSON.stringify(senderSocket.rooms));
  }

  async getMessages(dbClient: PrismaClient, numMessages?: number, offset = 0) {
    // TODO: perform validation of inputs, and use offset 
    if (numMessages) {
      const numTotalMessages = this.messages.length;

      console.log("before query Raw for getting messages");

      // https://stackoverflow.com/questions/73693136/prisma-postgresql-queryraw-error-code-42p01-table-does-not-exist
      // postgresql is case sensitive, but prisma turns everything lowercase, hence
      // the double quotes
      // Why fetch over limit + offset? fetch supported by SQL standard
      const dbMessages = await dbClient.$queryRaw<userMessage[]>`
        SELECT username, body FROM "ChatMessages" WHERE roomname = ${this.roomName} 
        ORDER BY id DESC OFFSET ${offset} ROWS FETCH FIRST ${numMessages} ROWS ONLY;`;

      // const dbTest = await dbClient.$queryRaw<userMessage[]>`SELECT * FROM "ChatMessages";`;
      // console.log(JSON.stringify(dbTest));

      console.log("after query Raw for getting messages");

      // only really need to fetch messages when 1. need past messages 
      // 2. on start, when we have no messages
      if (this.messages.length === 0) {
        this.messages = dbMessages;
      }

      // slice is [start, end)
      return this.messages.slice(numTotalMessages - numMessages - 1, numTotalMessages);
    }
    return [];
  }
};


class ChatRoomController {
  private roomNameToChatRoom: Map<string, ChatRoom>;
  private roomNameToId: Map<string, number>;

  private dbClient: PrismaClient;

  constructor(dbClient: PrismaClient) {
    this.roomNameToChatRoom = new Map<string, ChatRoom>();
    this.roomNameToId  = new Map<string, number>();

    this.dbClient = dbClient;
    console.log("db client: " + this.dbClient);
  }

  async loadFromDatabase() {
    // fetch stuff
    const allRooms = await this.dbClient.chatRoom.findMany({});

    for (const room of allRooms) {
      this.roomNameToId.set(room.name, room.id);
      this.roomNameToChatRoom.set(room.name, new ChatRoom(room.id, room.name));
    }
  }

  // TODO: need a way to load stuff from the database into here
  // when creating a room, need to check if the room already exists 
  // 1. userJoinedRooms allows duplicate room names, ask that table
  // if user has new room name, if so, fetch the id (possible to have multiple
  // room names that are exactly the same, not sure how to deal with that)
  async createRoom(newRoomName: string) {
    if (this.roomNameToChatRoom.has(newRoomName)) {
      return null;
    }

    // upsert, only create if it doesn't exist
    const newRoomRecord = await this.dbClient.chatRoom.create({
      data: {
        name: newRoomName
      }
    });

    this.roomNameToId.set(newRoomName, newRoomRecord.id);
    this.roomNameToChatRoom.set(newRoomName, new ChatRoom(newRoomRecord.id, newRoomName));

    const newRoom: chatRoom = {
      name: newRoomName,
      id: newRoomRecord.id,
    };

    return newRoom;
  }

  joinRoom(socket: Socket, roomName: string, username: string): boolean {
    if(!this.roomNameToChatRoom.has(roomName)) {
      return false;
    }

    this.roomNameToChatRoom.get(roomName)?.joinRoom(socket, username, this.dbClient);
    return true; 
  }

  sendMessage(roomName: string, text: string, username: string, socket: Socket): boolean {
    const chatRoom = this.roomNameToChatRoom.get(roomName);
    if(chatRoom) {
      chatRoom.sendMessage(socket, username, text, this.dbClient);
      return true;
    }
    return false;
  }

  async getMessages(roomName: string, socket: Socket, numMessages?: number) {
    const chatRoom = this.roomNameToChatRoom.get(roomName);
    if(chatRoom) {
      const DEFAULT_MESSAGES_TO_DISPLAY = 20;

      const messages = await chatRoom.getMessages(this.dbClient, numMessages ?? DEFAULT_MESSAGES_TO_DISPLAY);
      const getMessageResponse: getChatMessages = {
        messages: messages
      };

      socket.emit(CHAT_GET_MESSAGE_SIGNAL, getMessageResponse);
    }
  }
}


export { ChatRoomController };