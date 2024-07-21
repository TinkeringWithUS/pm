const BACKEND_URL = "http://localhost:3000";

type mouseMove = {
  posX: number,  
  posY: number, 
};

type userInfo = {
  userId: number, 
  mouseInfo: mouseMove
};

type authValues = {
  username: string,
  password: string
};

type authResponse = {
  registered: boolean
  sessionToken: string
};


type loginInfo = {
  username: string, 
  sessionToken: string
};

type loginResponse = {
  loggedIn: boolean
};

type chatJoinRequest = {
  username: string, 
  sessionToken: string
};

type chatJoinRoomRequest = {
  username: string, 
  roomToJoin: string
};

type chatJoinRoomResponse = {
  roomsJoined: string[]
};

type chatCreateRoomRequest = {
  roomName: string
};

type chatCreateRoomResponse = {
  created: boolean
};

type chatRoom = {
  name: string,
};

type chatJoinResponse = {
  rooms: chatRoom[], 
};

// response and request for regular http stuff
export {
  type mouseMove, type userInfo, type authValues,
  type authResponse, type loginInfo, type loginResponse,
  type chatJoinRequest, type chatJoinResponse, 
  type chatJoinRoomRequest, type chatJoinRoomResponse,
  type chatCreateRoomRequest, type chatCreateRoomResponse,
  type chatRoom, BACKEND_URL
};

const DOC_CONNECT_SIGNAL = "doc-connect";

type mousePos = {
  x: number,
  y: number,
};

type userMove = {
  newMousePos: mousePos,
  username: string,
};

const MOVE_SIGNAL = "move";

type userMessage = {
  user: string,
  body: string,
};

// socketio exports
export {
  type mousePos, type userMove, type userMessage,
  DOC_CONNECT_SIGNAL, MOVE_SIGNAL
};

const CHAT_CREATE_SIGNAL = "chat create";

type chatCreateMessage = {
  username: string,
  roomname: string
};

const CHAT_SEND_MESSAGE_SIGNAL = "chat send message";

type chatMessage = {
  username: string,
  roomName: string,
  body: string
};

const CHAT_GET_MESSAGE_SIGNAL = "chat get message";

type getChatMessages = {
  messages: userMessage[]
};

const CHAT_NEW_MESSAGE_SIGNAL = "chat new message";

type newChatMessage = {
  username: string, 
  body: string
};

const ERROR_SIGNAL = "error";

export {
  type chatCreateMessage, CHAT_CREATE_SIGNAL, 
  type chatMessage, CHAT_SEND_MESSAGE_SIGNAL,
  type getChatMessages, CHAT_GET_MESSAGE_SIGNAL, 
  type newChatMessage, CHAT_NEW_MESSAGE_SIGNAL,
  ERROR_SIGNAL
};
