import { randomBytes } from "crypto";

import { User } from "./User";

const DOC_ID_LENGTH = 20;

// TODO: eventually make this a rich 
// text editor
class RealTimeDoc {
  private text: string = ""; 
  private docname: string = "";
  private activeUsers: User[] = [];
  private inactiveUsers: User[] = [];
  private docId: string;

  constructor(docname: string) { 
    this.docname = docname;
    this.docId = randomBytes(DOC_ID_LENGTH).toString("hex");
  }

  rename(newName: string): void {
    this.docname = newName;
  }

  addUser(newUser: User): boolean {
    // if user has already joined, return false
    if (this.getActiveUserIndex(newUser) >= 0 ||
      this.getInactiveUserIndex(newUser) >= 0) {
        return false;
    }

    this.activeUsers.push(newUser);
    return true;
  }

  leave(leavingUser: User): boolean {
    const activeIndex = this.getActiveUserIndex(leavingUser);

    if(activeIndex < 0) {
      return false;
    }

    // remove user from active user
    this.activeUsers.splice(activeIndex, 1);
    this.inactiveUsers.push(leavingUser);

    return true;
  }

  private getInactiveUserIndex(userToFind: User) {
    const activeIndex = this.activeUsers.findIndex(
      (currentUser) => User.isEqual(userToFind, currentUser)
    );

    return activeIndex;
  }

  private getActiveUserIndex(userToFind: User) {
    const activeIndex = this.activeUsers.findIndex(
      (currentUser) => User.isEqual(userToFind, currentUser)
    );

    return activeIndex;
  }

  addText(pos: number, edit: string): void {
    const beforeAdd = this.text.substring(0, pos);
    const afterAdd = this.text.substring(pos);

    this.text = beforeAdd + edit + afterAdd;
  }

  deleteText(start: number, end: number): void {
    const beforeDelete = this.text.substring(0, start);
    const afterDelete = this.text.substring(end);

    this.text = beforeDelete + afterDelete;
  }

  appendText(text: string): void {
    this.text += text;
  }

  static isEqual(doc: RealTimeDoc, otherDoc: RealTimeDoc) {
    return doc.docId === otherDoc.docId;
  }
};

export { RealTimeDoc };
