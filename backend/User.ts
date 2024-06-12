import { RealTimeDoc } from "./RealTimeDoc";

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

class User {

  private username: string;
  private password: string;
  private loginTime: Date; 

  private ownedDocs: RealTimeDoc[] = [];

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
    this.loginTime = new Date();
  }

  createDocument(name: string): void {
    const newDoc = new RealTimeDoc(name);
    allDocuments.push(newDoc);
    this.ownedDocs.push(newDoc);
  }

  joinDocument(document: RealTimeDoc): boolean {
    const docIndex = allDocuments.findIndex((doc) => {
      RealTimeDoc.isEqual(doc, document)
    });

    // document doesn't exist, or already joined
    if(docIndex < 0 || !allDocuments[docIndex].addUser(this)) {
      return false;
    }

    allDocuments[docIndex].addUser(this);
    return true;
  }

  isLoggedIn(): boolean {
    return Date.now() - this.loginTime.getTime()
      > secondsToMs(LOGIN_LIMIT_IN_SECONDS);
  }

  static isEqual(user: User, otherUser: User) {
    return user.username == otherUser.username &&
      user.password == otherUser.password;
  }
};

export { User };