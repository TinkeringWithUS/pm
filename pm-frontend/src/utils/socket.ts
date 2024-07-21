import { io } from 'socket.io-client';
import { BACKEND_URL } from '../../../shared/networkInterface';

// "undefined" means the URL will be computed from the `window.location` object
// const URL : string | undefined = process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000";

const socket = io(BACKEND_URL);

export {
  socket
};