import { FormEvent, useContext, useState } from "react";
import { BACKEND_URL, chatCreateRoomRequest, chatCreateRoomResponse, chatRoom } from "../../../../shared/networkInterface";

import { AuthContextValues } from "../../contexts/AuthContext";

import "./ChatCreateRoomModal.css";
import { ModalBackground } from "../../components/ModalBackground";


type ChatCreateRoomModalProps = {
  rooms: chatRoom[],
  createDialogVisibility: boolean,
  setCreateDialogVisibility: (visibility: boolean) => void,
  setAnyModalOpen: (modalOpen: boolean) => void,
  setRooms: (rooms: chatRoom[]) => void,
};

function ChatCreateRoomModal({ rooms, createDialogVisibility, setRooms, setAnyModalOpen, setCreateDialogVisibility }: ChatCreateRoomModalProps) {

  const { username } = useContext(AuthContextValues);

  const [createRoomName, setCreateRoomName] = useState("");

  const [errorMessage, setErrorMessage] = useState("");


  const handleCreateRoom = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const createRoomRequest: chatCreateRoomRequest = {
      username: username,
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
          setErrorMessage("Room not created.");
        } else {
          const createdRoom: chatRoom = {
            name: createRoomName,
            id: data.id
          };

          console.log("chat room create, createdRoom id: " + createdRoom.id);

          // TODO: trying to join the same room twice shouldn't create multiple
          // entries in the rooms sidebar
          if (rooms.length === 0) {
            setRooms([createdRoom]);
          } else {
            setRooms([...rooms, createdRoom]);
          }

          console.log("set rooms, rooms: " + JSON.stringify(rooms));
        }
      })
      .finally(() => {
        setCreateRoomName("");
        setCreateDialogVisibility(false);
        setAnyModalOpen(false);
      });
  }

  return (
    <>
      {
        createDialogVisibility && (
          <>
            <div id="create-room-modal">
              <form onSubmit={(event) => handleCreateRoom(event)} id="create-room-modal-form">
                <label htmlFor="create-chat-room">Room Name to Create</label>
                <input name="room" type="text" id="create-chat-room"
                  value={createRoomName}
                  onChange={(event) => setCreateRoomName(event.target.value)}
                />
                <button type="submit">Create</button>
              </form>
              {
                errorMessage !== "" && (
                  <p>
                    {errorMessage}
                  </p>
                )
              }
            </div>
            <ModalBackground isVisible={createDialogVisibility} setVisibility={setCreateDialogVisibility}>

            </ModalBackground>
          </>
        )
      }
    </>
  );
}




export { ChatCreateRoomModal };
