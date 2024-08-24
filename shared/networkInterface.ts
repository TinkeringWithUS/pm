const BACKEND_URL = "http://localhost:3000";

type mouseMove = {
  posX: number,  
  posY: number, 
};

type userInfo = {
  userId: number, 
  mouseInfo: mouseMove
};

const SESSION_COOKIE = "session-token";

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
  loggedIn: boolean,
  profilePicture: Blob | null
};

type chatJoinRequest = {
  username: string, 
  sessionToken: string
};

type chatJoinRoomRequest = {
  username: string, 
  roomToJoin: string,
  roomToJoinId: number,
};

type chatJoinRoomResponse = {
  roomsJoined: chatRoom[]
};

type chatCreateRoomRequest = {
  username: string,
  roomName: string
};

type chatCreateRoomResponse = {
  created: boolean,
  id: number
};

type chatSearchRoomRequest = {
  searchName: string
  // searchTerms: string[] // TODO: try this later, the sql query is quite difficult
};

type chatSearchRoomResponse = {
  foundRooms: chatRoom[]
};

type chatRoom = {
  name: string,
  id: number
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
  type chatSearchRoomRequest, type chatSearchRoomResponse,
  type chatRoom, BACKEND_URL,
  SESSION_COOKIE
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
  username: string,
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
