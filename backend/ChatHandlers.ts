import { Socket } from "socket.io";
import { usernamesToUsers } from "./AuthRoutes";
import { CHAT_CREATE_SIGNAL, CHAT_GET_MESSAGE_SIGNAL, CHAT_SEND_MESSAGE_SIGNAL, chatCreateMessage, chatMessage, ERROR_SIGNAL, getChatMessages } from "../shared/networkInterface";
import { ChatRoomModel } from "./ChatRoom";

const chatRoomModel = new ChatRoomModel();

// TODO: Do authentication for chats
function handleCreateRoom(createData: chatCreateMessage, socket: Socket) {

  const user = usernamesToUsers.get(createData.username);

  console.log("handle create room. room name: " + createData.roomname);

  if(!user) {
    // emit error message
    socket.emit(ERROR_SIGNAL, "User not found");
    return;
  }

  const chatRoomIndex = user.getRooms().findIndex((chatRoom) => {
    return chatRoom.name === createData.roomname;
  });

  if (chatRoomIndex > -1) {
    const chatRoom = user.getRooms().at(chatRoomIndex);


  } else {
    chatRoomModel.createRoom(createData.roomname);

    const user = usernamesToUsers.get(createData.username);
    user?.joinChatRoom({ name: createData.roomname });

    chatRoomModel.joinRoom(socket, createData.roomname);
  }
}

function handleGetMessages(roomName: string, socket: Socket, numMessages?: number) {
  console.log("handle get messsages called. room name: " + roomName + ".");
  chatRoomModel.getMessages(roomName, socket, numMessages);
}

function handleChatSendMessage(chatInfo: chatMessage, socket: Socket) {
  console.log("handle send messsages called. room name: " + chatInfo.roomName + ".");
  chatRoomModel.sendMessage(chatInfo.roomName, chatInfo.body, chatInfo.username, socket);
}


// Idea is to have model classes send messages to the client
// and this is where all client interactions get intercepted and processed
// output is located in model classes

// to send a message, query user model for room names user has (eventually 
// this should be room ids not room names (duplicate room names should be possible) 
// then display the room names, send over session token + room name to send message
// later on, use the session token, for now all the rooms will be global 


function registerChatHandlers(socket: Socket) {
  // TODO: figure out a way to pass the socket into the handlers
  socket.on(CHAT_SEND_MESSAGE_SIGNAL, (messageData: chatMessage) => { handleChatSendMessage(messageData, socket) })
  socket.on(CHAT_CREATE_SIGNAL, (createData: chatCreateMessage) => { handleCreateRoom(createData, socket) })
  socket.on(CHAT_GET_MESSAGE_SIGNAL, (roomName: string, numMessages?: number) => { handleGetMessages(roomName, socket, numMessages) })
}

export { registerChatHandlers, chatRoomModel };