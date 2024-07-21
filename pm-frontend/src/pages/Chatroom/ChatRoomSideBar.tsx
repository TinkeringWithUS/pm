
import { useContext, useEffect } from "react";

import { AuthContextValues } from "../../contexts/AuthContext";

import { chatRoom, chatJoinRequest, chatJoinResponse, BACKEND_URL } from "../../../../shared/networkInterface";


type RoomSideBarProps = {
  rooms: chatRoom[],
  setRooms: React.Dispatch<React.SetStateAction<chatRoom[]>>,
  setSelectedRoom: React.Dispatch<React.SetStateAction<number>>
  setJoinVisibility: (visibility: boolean) => void,
  setCreateVisibility: (visibility: boolean) => void
};

function ChatRoomSideBar({ rooms, setRooms, setSelectedRoom, setJoinVisibility, setCreateVisibility }: RoomSideBarProps) {

  const { username, sessionToken } = useContext(AuthContextValues);

  const handleJoin = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();

    setJoinVisibility(true);
  }

  const handleCreate = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();

    setCreateVisibility(true);
  }


  const chatJoinInfo: chatJoinRequest = {
    username: username,
    sessionToken: sessionToken
  };

  useEffect(() => {
    fetch(BACKEND_URL + "/chat", {
      method: "POST",
      body: JSON.stringify(chatJoinInfo),
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      }
    })
      .then((response) => {
        return response.json();
      })
      .then((joinInfo: chatJoinResponse) => {
        if (joinInfo.rooms.length == 0) {
          setRooms([{ name: "No Rooms" }]);
        } else {
          setRooms(joinInfo.rooms);
        }
      })
      .catch();
  }, []);

  return (
    <nav className="rooms-side-bar">
      <ul>
        {rooms.map((room, index) => {
          return (
            <li className="rooms-options" onClick={() => setSelectedRoom(index)}
              key={"" + room + index}>
              {room.name}
            </li>
          );
        })}
      </ul>
      <button onClick={event => handleJoin(event)}> Join </button>
      <button onClick={event => handleCreate(event)}> New Room </button>
    </nav>
  );
}

export { ChatRoomSideBar };
