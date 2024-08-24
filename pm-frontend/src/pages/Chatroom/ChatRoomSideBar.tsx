
import { useContext, useEffect, useRef } from "react";

import { AuthContextValues } from "../../contexts/AuthContext";

import { chatRoom, chatJoinRequest, chatJoinResponse, BACKEND_URL } from "../../../../shared/networkInterface";

import "./ChatRoomSideBar.css";


type RoomSideBarProps = {
  rooms: chatRoom[],
  setRooms: React.Dispatch<React.SetStateAction<chatRoom[]>>,
  handleSelectRoom: (roomNumber: number) => void,
};

function ChatRoomSideBar({ rooms, setRooms, handleSelectRoom }: RoomSideBarProps) {
  const prevSelectedRoom = useRef<HTMLElement | null>(null);

  const { username, sessionToken } = useContext(AuthContextValues);

  const chatJoinInfo: chatJoinRequest = {
    username: username,
    sessionToken: sessionToken
  };

  const handleSelectClick = (event: React.MouseEvent<HTMLLIElement, MouseEvent>, roomIndex: number) => {
    handleSelectRoom(roomIndex);

    // TODO: if selected, add new class to highlight that this room is currently selected
    if (prevSelectedRoom.current) {
      prevSelectedRoom.current.classList.remove("rooms-options-selected");
    }

    prevSelectedRoom.current = event.currentTarget;

    event.currentTarget.classList.add("rooms-options-selected");
  }

  useEffect(() => {
    fetch(BACKEND_URL + "/chat", {
      method: "POST",
      body: JSON.stringify(chatJoinInfo),
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      }
    })
      .then((response) => response.json())
      .then((joinInfo: chatJoinResponse) => {
        setRooms(joinInfo.rooms);
        console.log("join info rooms: " + JSON.stringify(joinInfo.rooms));
      })
      .catch();
  }, []);

  console.log("rooms: " + JSON.stringify(rooms));

  // takes rooms and weed out the non unique rooms
  // rooms is a list of objects, need to flatten them somehow
  // TODO: maybe a more concise and better way to do this?
  const uniqueRooms : chatRoom[] = [];
  const uniqueRoomIds = new Set();

  for(const room of rooms) {
    if(!uniqueRoomIds.has(room.id)) {
      uniqueRoomIds.add(room.id);
      uniqueRooms.push(room);
    }
  }

  return (
    <nav className="rooms-side-bar">
      <ul className="room-options">
        <li className="room-option">
          Joined Rooms
        </li>
        {rooms.length == 0 ?
          <li className="room-option"></li> :
          uniqueRooms.map((room, index) => {
            return (
              <li className="room-option" onClick={(event) => handleSelectClick(event, index)}
                key={"" + room + index}>
                {room.name}
              </li>
            );
          })}
      </ul>
    </nav>
  );
}

export { ChatRoomSideBar };
