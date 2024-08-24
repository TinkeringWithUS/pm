import { Router } from "express";
import { chatCreateRoomRequest, chatCreateRoomResponse, chatJoinRequest, chatJoinResponse, chatJoinRoomRequest, chatJoinRoomResponse, chatRoom, chatSearchRoomRequest, chatSearchRoomResponse } from "../shared/networkInterface";
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

async function initChat(chatJoinRequest: chatJoinRequest) {

  const chatResponse: chatJoinResponse = {
    rooms: []
  };

  const user = usernamesToUsers.get(chatJoinRequest.username);

  if (!user || !user.isLoggedIn(chatJoinRequest.sessionToken)) {
    // res.send(JSON.stringify(chatResponse));
    console.log("/chat, chat Response: " + JSON.stringify(chatResponse));

    for (const username in usernamesToUsers) {
      console.log("username: " + username);
      console.log("user: " + JSON.stringify(usernamesToUsers.get(username)?.getRecord()));
    }

    if (!user) {
      console.log("user not found");
      console.log("usernames to user: " + usernamesToUsers);
    } else if (!user.isLoggedIn(chatJoinRequest.sessionToken)) {
      console.log("user not logged in");
    }

    return JSON.stringify(chatResponse);
  }

  chatResponse.rooms = await user.getRooms(prisma);

  console.log("/chat, chat Response: " + JSON.stringify(chatResponse));
  return JSON.stringify(chatResponse);
}


async function chatJoinRoom(joinRequest: chatJoinRoomRequest) {
  const user = usernamesToUsers.get(joinRequest.username);
  const roomName = joinRequest.roomToJoin;

  const joinResponse: chatJoinRoomResponse = {
    roomsJoined: [],
  };

  console.log("user name: " + joinRequest.username);
  if (user) {
    console.log("got a user. ");
  } else {
    console.log("no valid user gotten");
  }

  console.log("join request: " + JSON.stringify(joinRequest));

  // if there's a valid user, send back available chat rooms no matter what
  // if there's not a valid user, send back empty
  if (user) {
    if (chatRoomNames.has(roomName)) {
      if (joinRequest.roomToJoinId === -1) {
        // trying to join a room we don't know the id of 
        // e.g. we are a user trying to join a room we didn't create
        // search for the room 
        // 2 things to support, 
        // 1. ability to search for the room (by name and later on description
        // or whatever else we want)
        // 2. ability to join via a link (e.g. a share me link)
        // let the frontend handle searching for the correct room to join without
        // an id
        return JSON.stringify(joinResponse);

      } else {
        user.joinChatRoom(joinRequest.roomToJoinId, prisma);
      }

      console.log("/chat/join. chat room name: " + roomName);
      console.log("/chat/join should have a room for this user");
    }
    joinResponse.roomsJoined = await user.getRooms(prisma);
  }

  return JSON.stringify(joinResponse);
}

async function chatCreateRoom(createRequest: chatCreateRoomRequest) {
  const createResponse: chatCreateRoomResponse = {
    created: false,
    id: -1,
  };

  // effectively want to re run join
  const newRoom = await chatRoomController.createRoom(createRequest.roomName);

  const user = usernamesToUsers.get(createRequest.username);


  if (newRoom && user) {
    createResponse.created = true;
    createResponse.id = newRoom.id;
    chatRoomNames.add(createRequest.roomName);

    console.log("/chat/create. create room name: " + createRequest.roomName);

    const userHasJoined = await user.joinChatRoom(newRoom.id, prisma);

    if (!userHasJoined) {
      console.error("Handle /chat/create failure to join");
    }

    for (const roomNames of chatRoomNames) {
      console.log("room name: " + roomNames);
    }
  }

  return JSON.stringify(createResponse);
}

async function chatSearchRoom(searchRequest: chatSearchRoomRequest) {
  const rooms = await chatRoomController.searchRooms(searchRequest.searchName);

  const searchResponse : chatSearchRoomResponse = {
    foundRooms: rooms
  };

  return JSON.stringify(searchResponse);
}

// TODO: handle authentication later on (write express middleware?)
chatRouter.post("/chat", async (req, res) => {
  const chatJoinRequest: chatJoinRequest = req.body;

  const response = initChat(chatJoinRequest);

  res.send(response);
});


chatRouter.post("/chat/join", async (req, res) => {
  const joinRequest: chatJoinRoomRequest = req.body;

  const response = chatJoinRoom(joinRequest);

  res.send(response);
});


chatRouter.post("/chat/create", async (req, res) => {
  const createRequest: chatCreateRoomRequest = req.body;

  const response = chatCreateRoom(createRequest);

  res.send(response);
});


chatRouter.post("/chat/search", (req, res) => {
  const searchRequest : chatSearchRoomRequest = req.body;

  const response = chatSearchRoom(searchRequest);

  res.send(response);
});



export { chatRouter };