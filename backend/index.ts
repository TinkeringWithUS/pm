import express, { json } from "express";
import { createServer } from "http";
import { Server } from "socket.io";

import cors from "cors";

import { authRouter } from "./AuthRoutes";
import { docRouter } from "./DocRoutes";

import { DOC_CONNECT_SIGNAL, MOVE_SIGNAL, mousePos } from "../shared/networkInterface";
import { chatRouter } from "./ChatRoutes";
import { registerChatHandlers } from "./ChatHandlers";
import { config } from "dotenv";
import { profileRouter } from "./ProfileRoutes";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});

const PORT = process.env.PORT || 3000;

// should read the db.env file
try {
  config({ path: "./db.env" });
} catch {
  console.log("No env file for database connection.");
}

app.use(cors());
app.use(json());

httpServer.listen(PORT, () => {
  console.log(`http server listening on http://localhost:${PORT}`);
});

// app.listen(PORT, () => {
//   console.log(`Listening on http://localhost:${PORT}`);
// });

app.get("/", (req, res) => {
  res.send("hi");
});

app.use("/", authRouter);
app.use("/", docRouter);
app.use("/", chatRouter);
app.use("/", profileRouter);

io.on("connection", (socket) => {
  // for now, everything will be localized to one 
  // room, e.g. room 0 
  // socket.on(DOC_CONNECT_SIGNAL, () => {
  //   socket.join("room0");
  // });

  // plan for consistency 
  // LWW, last writer wins
  // https://jakelazaroff.com/words/an-interactive-intro-to-crdts/
  // can't use actual physical timestamps, must
  // use either lamport clocks, or, because we're
  // using a central server, just a counter

  // server broadcasts messages to clients in 
  // the same document room, everyone else 
  // should see this current user's cursor 
  // move to mouseInfo
  // socket.on(MOVE_SIGNAL, (mouseInfo: mousePos) => {
  //   socket.to("room0").emit("", mouseInfo);
  // });

  registerChatHandlers(socket);
});
