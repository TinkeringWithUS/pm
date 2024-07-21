import { chatRoom } from "../shared/networkInterface";
import { RealTimeDoc } from "./RealTimeDoc";

import { randomBytes } from "crypto";

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

type userJson = {
  username: string,
  password: string;
  loginTime: Date;
  activeSessionToken: string;
  chatRoomNames: chatRoom[];
};

class User {

  private username: string;
  private password: string;
  private loginTime: Date; 
  private activeSessionToken: string;

  private chatRoomNames: chatRoom[];

  private ownedDocs: RealTimeDoc[] = [];

  constructor(username: string, password: string, loginTime?: Date,
    activeSessionToken?: string, chatRoomNames?: chatRoom[]) {
    this.username = username;
    this.password = password;

    this.loginTime = loginTime ?? new Date();
    this.activeSessionToken = activeSessionToken ?? "";
    this.chatRoomNames = chatRoomNames ?? [];
  }

  public registerUser() {
    this.activeSessionToken = generateSessionToken();
    return this.activeSessionToken;
  }

  // public createDocument(name: string): void {
  //   const newDoc = new RealTimeDoc(name);
  //   allDocuments.push(newDoc);
  //   this.ownedDocs.push(newDoc);
  // }

  // public joinDocument(document: RealTimeDoc): boolean {
  //   const docIndex = allDocuments.findIndex((doc) => {
  //     RealTimeDoc.isEqual(doc, document)
  //   });

  //   // document doesn't exist, or already joined
  //   if(docIndex < 0 || !allDocuments[docIndex].addUser(this)) {
  //     return false;
  //   }

  //   allDocuments[docIndex].addUser(this);
  //   return true;
  // }

  public isLoggedIn(sessionToken: string): boolean {
    if(this.activeSessionToken !== sessionToken) {
      return false;
    }
    return Date.now() - this.loginTime.getTime()
      > secondsToMs(LOGIN_LIMIT_IN_SECONDS);
  }

  public signIn(password: string) {
    if(this.password === password) {
      this.activeSessionToken = generateSessionToken();
      this.loginTime = new Date();
      return this.activeSessionToken;
    }
    return "";
  }

  public joinChatRoom(room: chatRoom) {
    this.chatRoomNames.push(room);
  }

  // TODO: replace
  public getRooms() {
    return this.chatRoomNames;
  }

  public static isEqual(user: User, otherUser: User) {
    return user.username == otherUser.username &&
      user.password == otherUser.password;
  }

  public json() {
    const jsonObject : userJson = {
      username: this.username,
      password: this.password,
      loginTime: this.loginTime,
      activeSessionToken: this.activeSessionToken,
      chatRoomNames: this.chatRoomNames
    };  

    return jsonObject;
  }
};

export { User, userJson };