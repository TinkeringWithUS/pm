import { Router } from "express";
import { chatCreateRoomRequest, chatCreateRoomResponse, chatJoinRequest, chatJoinResponse, chatJoinRoomRequest, chatJoinRoomResponse, chatRoom } from "../shared/networkInterface";
import { usernamesToUsers } from "./AuthRoutes";
import { chatRoomController } from "./ChatHandlers";
import { PrismaClient } from "@prisma/client";

const chatRoomNames = new Set<string>();

const chatRouter = Router();

// use socket io to handle receiving and sending messages

/**
 * Current plan
 * 
 * these routes will be used to fetch room names
 * once client gets room names, send it over socketio
 * with chat message signal (use)
 * 
 */

const prisma = new PrismaClient();

// TODO: handle authentication later on (write express middleware?)
chatRouter.post("/chat", (req, res) => {
  const chatJoinRequest: chatJoinRequest = req.body;

  const chatResponse: chatJoinResponse = {
    rooms: []
  };

  const user = usernamesToUsers.get(chatJoinRequest.username);

  if (!user || !user.isLoggedIn(chatJoinRequest.sessionToken)) {
    res.send(JSON.stringify(chatResponse));
    return;
  }
  chatResponse.rooms = user.getRooms();

  res.send(JSON.stringify(chatResponse));
});

chatRouter.post("/chat/join", async (req, res) => {
  const joinRequest: chatJoinRoomRequest = req.body;

  const user = usernamesToUsers.get(joinRequest.username);
  const roomName = joinRequest.roomToJoin;

  const joinResponse: chatJoinRoomResponse = {
    roomsJoined: [],
  };

  console.log("user name: " + joinRequest.username);
  if(user) {
    console.log("got a user. ");
  } else {
    console.log("no valid user gotten");
  }

  console.log("join request username: " + joinRequest.username);
  console.log("join request roomToJoinId: " + joinRequest.roomToJoinId);
  console.log("join request roomToJoin: " + joinRequest.roomToJoin);

  // if there's a valid user, send back available chat rooms no matter what
  // if there's not a valid user, send back empty
  if (user) {
    if (chatRoomNames.has(roomName)) {
      user.joinChatRoom(joinRequest.roomToJoinId, prisma);

      console.log("/chat/join. chat room name: " + roomName);
      console.log("/chat/join should have a room for this user");
    }
    joinResponse.roomsJoined = user.getRooms();
  }

  res.send(JSON.stringify(joinResponse));
});

chatRouter.post("/chat/create", async (req, res) => {
  const createRequest: chatCreateRoomRequest = req.body;

  const createResponse: chatCreateRoomResponse = {
    created: false
  };

  const newRoom = await chatRoomController.createRoom(createRequest.roomName);

  if(newRoom) {
    createResponse.created = true;
    chatRoomNames.add(createRequest.roomName);

    console.log("/chat/create. create room name: " + createRequest.roomName);

    for(const roomNames of chatRoomNames) {
      console.log("room name: " + roomNames);
    }
  }

  res.send(JSON.stringify(createResponse));
});


export { chatRouter };