import { Socket } from "socket.io";
import { usernamesToUsers } from "./AuthRoutes";
import { CHAT_CREATE_SIGNAL, CHAT_GET_MESSAGE_SIGNAL, CHAT_SEND_MESSAGE_SIGNAL, chatCreateMessage, chatMessage, ERROR_SIGNAL, getChatMessages } from "../shared/networkInterface";
import { ChatRoomController } from "./ChatRoomController";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient(); 
const chatRoomController = new ChatRoomController(prisma);
chatRoomController.loadFromDatabase();

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

  // trying to create a room that already exists
  if (chatRoomIndex > -1) {
    const chatRoom = user.getRooms().at(chatRoomIndex);

  } else {
    chatRoomController.createRoom(createData.roomname)
    .then((newRoom) => {
      if(newRoom) {
        // TODO: Error handling for when !user
        const user = usernamesToUsers.get(createData.username);
        user?.joinChatRoom(newRoom.id, prisma);

        chatRoomController.joinRoom(socket, createData.roomname, createData.username);
      }
    });
  }
}

function handleGetMessages(roomName: string, socket: Socket, numMessages?: number) {
  console.log("handle get messsages called. room name: " + roomName + ".");
  chatRoomController.getMessages(roomName, socket, numMessages);
}

// not possible to send a message without 
// TODO: add checks to ensure user has permissions to be typing in this
// chat room
function handleChatSendMessage(chatInfo: chatMessage, socket: Socket) {
  console.log("handle send messsages called. room name: " + chatInfo.roomName + ".");
  chatRoomController.joinRoom(socket, chatInfo.roomName, chatInfo.username);
  chatRoomController.sendMessage(chatInfo.roomName, chatInfo.body, chatInfo.username, socket);
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

export { registerChatHandlers, chatRoomController };
