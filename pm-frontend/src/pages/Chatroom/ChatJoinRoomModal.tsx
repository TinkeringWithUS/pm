import { useContext, useState } from "react";
import { FormEvent } from "react";

import { AuthContextValues } from "../../contexts/AuthContext";

import { BACKEND_URL, chatJoinRoomRequest, chatJoinRoomResponse, chatRoom, chatSearchRoomResponse } from "../../../../shared/networkInterface";

import { joinRoom } from "./ChatUtils";

import "./ChatJoinRoomModal.css";
import { ModalBackground } from "../../components/ModalBackground";

type ChatJoinRoomModalProps = {
  rooms: chatRoom[],
  joinDialogVisibility: boolean,
  setJoinDialogVisibility: (visibility: boolean) => void,
  setAnyModalOpen: (modalOpen: boolean) => void,
  setRooms: (rooms: chatRoom[]) => void,
  setSelectedRoom: (roomNumber: number) => void,
};

function ChatJoinRoomModal({ rooms, joinDialogVisibility, setRooms, setJoinDialogVisibility, setAnyModalOpen, setSelectedRoom }: ChatJoinRoomModalProps) {
  const { username } = useContext(AuthContextValues);

  const [joinRoomName, setJoinRoomName] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const [searchedRooms, setSearchedRooms] = useState<chatRoom[]>([]);

  // pop up the search feature to find the room to join
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if(event.target.value.length == 1) {
      fetch(BACKEND_URL + "/chat/search")
        .then((response) => response.json())
        .then((searchResponse: chatSearchRoomResponse) => {
          setSearchedRooms(searchResponse.foundRooms);
        });
    }
  }

  const handleJoinRoom = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const roomToJoin = rooms.find((room) => room.name === joinRoomName);


    // TODO: get the chat room name to join from event (idk without internet skull)
    const chatJoinRoomInfo: chatJoinRoomRequest = {
      username: username,
      roomToJoin: joinRoomName,
      roomToJoinId: roomToJoin ? roomToJoin.id : -1,
    };

    console.log("username: " + username);
    console.log("join room name: " + joinRoomName);

    joinRoom(chatJoinRoomInfo)
      .then((joinResponse: chatJoinRoomResponse) => {
        const joinedRoomIndex = joinResponse.roomsJoined.findIndex((room) => room.name === joinRoomName);

        console.log("/chat/join response: " + JSON.stringify(joinResponse));
        console.log("joined room index: " + joinedRoomIndex);

        if (joinedRoomIndex < 0) {
          setErrorMessage("Room not joined.");
          console.log("room not joined");
        } else {
          const newRoom: chatRoom = {
            name: joinRoomName,
            id: joinedRoomIndex
          };

          console.log("joined room index >= 0");

          if (rooms.length === 0) {
            console.log("rooms length == 0, joining new room: " + newRoom.name);
            setRooms([newRoom]);
            setSelectedRoom(0);
          } else {
            console.log("rooms length > 0, appending new room name: " + newRoom.name);
            setSelectedRoom(rooms.length);
            setRooms([...rooms, newRoom]);
          }
        }
      })
      .finally(() => {
        setJoinRoomName("");
        setJoinDialogVisibility(false);
        setAnyModalOpen(false);
      });
  }

  return (
    <>
      {
        joinDialogVisibility && (
          <>
            <div id="join-room-modal">
              <form onSubmit={(event) => { handleJoinRoom(event) }} id="join-room-modal-form">
                <label htmlFor="join-chat-room">Room Name to Join</label>
                <input name="room" type="text" id="join-chat-room"
                  value={joinRoomName}
                  onChange={(event) => setJoinRoomName(event.target.value)} />
                <button type="submit">Join</button>
              </form>
              {
                errorMessage !== "" && (
                  <p>
                    {errorMessage}
                  </p>
                )
              }
              <SearchList foundRooms={searchedRooms}>
              </SearchList> 

              {/* {console.log("error message: " + errorMessage)} */}
            </div>
            <ModalBackground isVisible={joinDialogVisibility} setVisibility={setJoinDialogVisibility}>
            </ModalBackground>
            {/* <div id="join-modal-background"> </div> */}
          </>
        )
      }
    </>
  );
}


type SearchListProps = {
  foundRooms: chatRoom[]
};

function SearchList({foundRooms}: SearchListProps) {



  return (
    <ul>
      {
        foundRooms.map((room) => {
          return (
            <ul id="search-possible-rooms-list">
              <SearchListItem roomId={room.id} roomname={room.name}>

              </SearchListItem>
            </ul>
          );
        })
      }
    </ul>
  );
}


type SearchListItemProps = {
  roomname: string,
  roomId: number
};

function SearchListItem({roomname, roomId}: SearchListItemProps) {

  const {username} = useContext(AuthContextValues);

  const handleClick = (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    const joinChatRoom : chatJoinRoomRequest = {
      username:  username,
      roomToJoin: roomname,
      roomToJoinId: roomId
    };

    joinRoom(joinChatRoom) 
    .then((response) => {
      const joinedIndex = response.roomsJoined.findIndex((joinedRoom) => {
        return joinedRoom.id === roomId;
      });

      if(joinedIndex < 0) {
        // couldn't find it, 
        
      }
    })
    .catch(() => {
      console.log("fetch failed, TODO: handle fetch failure");
    });
  }

  return (
    <li onClick={(event) => handleClick(event)}>
      <span>{roomname}</span>
    </li>
  );
}




export { ChatJoinRoomModal };
