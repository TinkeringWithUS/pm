import { FormEvent, useContext, useEffect, useState } from "react";

import { BACKEND_URL, chatCreateRoomRequest, chatCreateRoomResponse, chatJoinRoomRequest, chatRoom } from "../../../../shared/networkInterface";
import { DEFAULT_ROOM_NAME } from "./chatConstants";

import { socket } from "../../utils/socket";

import { AuthContextValues } from "../../contexts/AuthContext";
import { ChatMessageDisplay } from "./ChatMessages";
import { ChatRoomSideBar } from "./ChatRoomSideBar";


function ChatroomView() {

  const [rooms, setRooms] = useState<chatRoom[]>([{ name: DEFAULT_ROOM_NAME }]);

  const [selectedRoom, setSelectedRoom] = useState<number>(0);

  const [joinDialogVisibility, setJoinDialogVisibility] = useState(false);
  const [joinRoomName, setJoinRoomName] = useState("");
  // TODO: use room id system instead of room names
  // const [joinRoomId, setJoinRoomId] = useState(0);

  const [createDialogVisibility, setCreateDialogVisibility] = useState(false);
  const [createRoomName, setCreateRoomName] = useState("");

  const [chatRoomError, setChatRoomError] = useState(false);

  // const [isConnected, setIsConnected] = useState(socket.connected);
  const { username } = useContext(AuthContextValues);

  console.log("user name from auth context: " + username);

  // grab chat rooms current person is in 
  // TODO: eventually support servers
  const handleSelectRoom = (roomIndex: number) => {
    setSelectedRoom(roomIndex);
  }

  const handleJoinRoom = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // TODO: get the chat room name to join from event (idk without internet skull)
    const chatJoinRoomInfo: chatJoinRoomRequest = {
      username: username,
      roomToJoin: joinRoomName
    };

    console.log("username: " + username);
    console.log("join room name: " + joinRoomName);

    fetch(BACKEND_URL + "/chat/join", {
      method: "POST",
      body: JSON.stringify(chatJoinRoomInfo),
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      }
    })
      .then(response => response.json())
      .then((joinResponse: chatCreateRoomResponse) => {

        console.log("/chat/join response: " + JSON.stringify(joinResponse));

        if (!joinResponse.created) {
          setChatRoomError(true);
        }
      })
      .finally(() => {
        const newRoom : chatRoom = {
          name: joinRoomName
        };

        if(rooms[0].name === DEFAULT_ROOM_NAME) {
          setRooms([newRoom]);
        } else {
          setRooms([...rooms, newRoom]);
        }

        setJoinRoomName("");
        setJoinDialogVisibility(false);
      });
  }

  // TODO: don't worry about authentication for joining for now, just send 
  // over the username
  const handleCreateRoom = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const createRoomRequest: chatCreateRoomRequest = {
      roomName: createRoomName
    };

    fetch(BACKEND_URL + "/chat/create", {
      method: "POST",
      body: JSON.stringify(createRoomRequest),
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      }
    })
      .then(response => response.json())
      .then((data: chatCreateRoomResponse) => {
        console.log("/chat/create. response: " + JSON.stringify(data));

        if (!data.created) {
          // throw an error
          // TODO: on chat room error, pop up error display
          setChatRoomError(true);
        }
      })
      .finally(() => {
        setCreateRoomName("");
        setCreateDialogVisibility(false);
      });
  }

  // TODO: trigger fetch messages when things change, e.g. new messages, 
  // joining new rooms 
  // TODO: fix selected room selection

  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);


  return (
    <div>
      <ChatRoomSideBar rooms={rooms}
        setJoinVisibility={setJoinDialogVisibility}
        setCreateVisibility={setCreateDialogVisibility}
        setRooms={setRooms}
        setSelectedRoom={setSelectedRoom}>

      </ChatRoomSideBar>

      <div>
        Current Room: {rooms[selectedRoom].name}
      </div>

      {/*  Only logged in users can put messages, nobody else can */}
      {
        joinDialogVisibility && (
          <form onSubmit={(event) => { handleJoinRoom(event) }}>
            <label htmlFor="join-chat-room">Room Id to Join</label>
            <input name="room" type="text" id="join-chat-room"
              value={joinRoomName}
              onChange={(event) => setJoinRoomName(event.target.value)} />
            <button type="submit">Join</button>
          </form>)
      }

      {
        createDialogVisibility && (
          <form onSubmit={(event) => handleCreateRoom(event)}>
            <label htmlFor="create-chat-room">Room Name to Create</label>
            <input name="room" type="text" id="create-chat-room"
              value={createRoomName}
              onChange={(event) => setCreateRoomName(event.target.value)} />
            <button type="submit">Create</button>
          </form>)
      }

      <ChatMessageDisplay currentRoomName={rooms[selectedRoom].name}>

      </ChatMessageDisplay>
    </div>
  );
}


export { ChatroomView };
