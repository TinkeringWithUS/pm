import { useContext, useEffect, useState } from "react";

import { chatJoinRoomRequest, chatJoinRoomResponse, chatRoom } from "../../../../shared/networkInterface";
import { DEFAULT_ROOM_NAME } from "./chatConstants";

import { socket } from "../../utils/socket";

import { AuthContextValues } from "../../contexts/AuthContext";
import { ChatMessageDisplay } from "./ChatMessages";
import { ChatRoomSideBar } from "./ChatRoomSideBar";

import { joinRoom } from "./ChatUtils";
import { ChatJoinRoomModal } from "./ChatJoinRoomModal";
import { ChatCreateRoomModal } from "./ChatCreateRoomModal";

import "./ChatroomView.css";
import { modalContextValues } from "../../contexts/ModalContext";

function ChatroomView() {

  const { username } = useContext(AuthContextValues);
  const { anyModalOpen, setAnyModalOpen } = useContext(modalContextValues);

  // TODO: use room id system instead of room names
  // const [joinRoomId, setJoinRoomId] = useState(0);
  const [rooms, setRooms] = useState<chatRoom[]>([{ id: -1, name: DEFAULT_ROOM_NAME }]);
  const [selectedRoom, setSelectedRoom] = useState<number>(0);

  const [joinDialogVisibility, setJoinDialogVisibility] = useState(false);
  const [createDialogVisibility, setCreateDialogVisibility] = useState(false);

  const [joinRoomName] = useState("");

  // TODO: let anyModalOpen be an operation rather than state
  // why? can deduce this variable from given variables, no need 
  // for this to exist
  // const [anyModalOpen, setAnyModalOpen] = useState(false);

  console.log("user name from auth context: " + username);

  // TODO: refactor so logic is in the component where it's most relevant

  // grab chat rooms current person is in 
  const handleSelectRoom = (roomIndex: number) => {

    // when changing selections, make a request to grab recent messages
    // from the room
    if (roomIndex === selectedRoom) {
      return;
    }

    setSelectedRoom(roomIndex);

    const joinRoomInfo: chatJoinRoomRequest = {
      username: username,
      roomToJoin: rooms[roomIndex].name,
      roomToJoinId: rooms[roomIndex].id
    };

    joinRoom(joinRoomInfo)
      .then((joinResponse: chatJoinRoomResponse) => {
        if (!joinResponse.roomsJoined.find((room) => room.name === joinRoomName)) {
          console.error("programming error, trying to join a room that doesn't exist in handle select room");
        }
      });
  }


  // TODO: don't worry about authentication for joining for now, just send 
  // over the username
  const handleJoin = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();

    if (!joinDialogVisibility && !anyModalOpen) {
      setJoinDialogVisibility(true);
      setAnyModalOpen(true);
    } else if (joinDialogVisibility && anyModalOpen) {
      setJoinDialogVisibility(false);
      setAnyModalOpen(false);
    }
  }

  const handleCreate = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();

    // TODO: somehow need to only display one modal at a time, 
    // display modal when no other modals are set
    if (!createDialogVisibility && !anyModalOpen) {
      setCreateDialogVisibility(true);
      setAnyModalOpen(true);
    } else if (createDialogVisibility && anyModalOpen) {
      setCreateDialogVisibility(false);
      setAnyModalOpen(false);
    }
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

  useEffect(() => {
    console.log("select room changed. new selected room: " + selectedRoom);
    console.log(JSON.stringify(rooms));
  }, [rooms]);


  return (
    <div id="chatroom-view">
      <div id="chatroom-view-side">
        <ChatRoomSideBar rooms={rooms}
          setRooms={setRooms}
          handleSelectRoom={handleSelectRoom}>

        </ChatRoomSideBar>
      </div>
      <div id="chatroom-view-main">
        <button onClick={event => handleJoin(event)} className="join-room-modal-button"> Join </button>
        <button onClick={event => handleCreate(event)} className="create-room-modal-button"> New Room </button>

        <div className="current-joined-room-display">
          Current Room: {rooms.length === 0 ? DEFAULT_ROOM_NAME : rooms[selectedRoom].name}
        </div>

        {/*  Only logged in users can put messages, nobody else can */}
        <ChatJoinRoomModal rooms={rooms} setRooms={setRooms}
          setAnyModalOpen={setAnyModalOpen} setSelectedRoom={setSelectedRoom}
          joinDialogVisibility={joinDialogVisibility}
          setJoinDialogVisibility={setJoinDialogVisibility}>

        </ChatJoinRoomModal>

        <ChatCreateRoomModal rooms={rooms} setRooms={setRooms}
          setAnyModalOpen={setAnyModalOpen} createDialogVisibility={createDialogVisibility}
          setCreateDialogVisibility={setCreateDialogVisibility}>

        </ChatCreateRoomModal>

        <ChatMessageDisplay currentRoomName={
          rooms.length === 0 ? DEFAULT_ROOM_NAME : rooms[selectedRoom].name}>

        </ChatMessageDisplay>
      </div>
    </div>
  );
}


export { ChatroomView };
