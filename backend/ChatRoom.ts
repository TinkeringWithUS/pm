import { Socket } from "socket.io";
import { CHAT_GET_MESSAGE_SIGNAL, CHAT_SEND_MESSAGE_SIGNAL, CHAT_NEW_MESSAGE_SIGNAL, getChatMessages, userMessage, newChatMessage } from "../shared/networkInterface";

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

  private chatRoomId: string;

  constructor(chatRoomId: string) {
    this.messages = [];
    this.chatRoomId = chatRoomId;
  }

  joinRoom(socket: Socket) {
    socket.join(this.chatRoomId);
  }

  leaveRoom(socket: Socket) {
    socket.leave(this.chatRoomId);
  }

  sendMessage(senderSocket: Socket, username: string, text: string) {
    const message: userMessage = {
      user: username,
      body: text
    };

    this.messages.push(message);

    // no guarantee that socket is in the room
    this.joinRoom(senderSocket);

    console.log("sender socket rooms: " + JSON.stringify(senderSocket.rooms));
    console.log("send message, username: " + username + ". text: " + text);

    const newMessage: newChatMessage = {
      username: username,
      body: text
    };

    // senderSocket.to(this.chatRoomId).emit(CHAT_SEND_MESSAGE_SIGNAL, message);
    senderSocket.to(this.chatRoomId).emit(CHAT_NEW_MESSAGE_SIGNAL, newMessage);

    console.log("sending chat new message signal with message: " + JSON.stringify(newMessage) + ". chat room id: " + this.chatRoomId)
    console.log("rooms current socket is in: " + JSON.stringify(senderSocket.rooms));
  }

  getMessages(numMessages?: number): userMessage[] {
    if (numMessages) {
      const numTotalMessages = this.messages.length;
      // slice is [start, end)
      return this.messages.slice(numTotalMessages - numMessages - 1, numTotalMessages);
    }
    return [];
  }
};


class ChatRoomModel {
  private roomNameToChatRoom: Map<string, ChatRoom>;
  private nextRoomId: number;

  constructor() {
    this.roomNameToChatRoom = new Map<string, ChatRoom>();
    this.nextRoomId = 0;
  }

  createRoom(newRoomName: string): boolean {
    if(this.roomNameToChatRoom.has(newRoomName)) {
      return false;
    }
    this.roomNameToChatRoom.set(newRoomName, new ChatRoom("" + this.nextRoomId));
    this.nextRoomId++;

    return true;
  }

  joinRoom(socket: Socket, roomName: string): boolean {
    if(!this.roomNameToChatRoom.has(roomName)) {
      return false;
    }

    this.roomNameToChatRoom.get(roomName)?.joinRoom(socket);
    return true; 
  }

  sendMessage(roomName: string, text: string, username: string, socket: Socket): boolean {
    const chatRoom = this.roomNameToChatRoom.get(roomName);
    if(chatRoom) {
      chatRoom.sendMessage(socket, username, text);
      return true;
    }
    return false;
  }

  getMessages(roomName: string, socket: Socket, numMessages?: number) {
    const chatRoom = this.roomNameToChatRoom.get(roomName);
    if(chatRoom) {

      const DEFAULT_MESSAGES_TO_DISPLAY = 20;

      const messages = chatRoom.getMessages(numMessages ?? DEFAULT_MESSAGES_TO_DISPLAY);
      const getMessageResponse: getChatMessages = {
        messages: messages
      };

      socket.emit(CHAT_GET_MESSAGE_SIGNAL, getMessageResponse);
    }
  }
}


export { ChatRoomModel };