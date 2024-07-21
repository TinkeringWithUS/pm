import { io } from "socket.io-client";
import { BACKEND_URL } from "../../../shared/networkInterface";



const socket = io(BACKEND_URL);

export { socket };

