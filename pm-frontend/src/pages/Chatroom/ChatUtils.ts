import { BACKEND_URL, chatJoinRoomRequest, chatJoinRoomResponse } from "../../../../shared/networkInterface";




async function joinRoom(joinRoomInfo: chatJoinRoomRequest): Promise<chatJoinRoomResponse> {
  const response = await fetch(BACKEND_URL + "/chat/join", {
    method: "POST",
    body: JSON.stringify(joinRoomInfo),
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    }
  });

  return response.json();
}



export { joinRoom };