import { Router } from "express";
import { chatCreateRoomRequest, chatCreateRoomResponse, chatJoinRequest, chatJoinResponse, chatJoinRoomRequest, chatRoom } from "../shared/networkInterface";
import { usernamesToUsers } from "./AuthRoutes";
import { chatRoomModel } from "./ChatHandlers";

const chatRoomNames = new Set<string>();

let newRoomId = 0;

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

chatRouter.post("/chat/join", (req, res) => {
  const joinRequest: chatJoinRoomRequest = req.body;

  const user = usernamesToUsers.get(joinRequest.username);
  const roomName = joinRequest.roomToJoin;

  const joinResponse: chatJoinResponse = {
    rooms: [],
  };

  console.log("user name: " + joinRequest.username);
  if(user) {
    console.log("got a user. ");
  } else {
    console.log("no valid user gotten");
  }

  console.log("join request username: " + joinRequest.username);

  // if there's a valid user, send back available chat rooms no matter what
  // if there's not a valid user, send back empty
  if (user) {
    if (chatRoomNames.has(roomName)) {
      const chatRoom: chatRoom = {
        name: roomName,
      };
      user.joinChatRoom(chatRoom);
      console.log("/chat/join. chat room name: " + chatRoom.name);
      console.log("/chat/join should have a room for this user");
    }
    joinResponse.rooms = user.getRooms();
  }

  res.send(JSON.stringify(joinResponse));
});

chatRouter.post("/chat/create", (req, res) => {
  const createRequest: chatCreateRoomRequest = req.body;

  const createResponse: chatCreateRoomResponse = {
    created: false
  };

  if(chatRoomModel.createRoom(createRequest.roomName)) {
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