import express, { json } from "express";
import { createServer } from "http";
import { Server } from "socket.io";

import cors from "cors";

import { authRouter } from "./AuthRoutes";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(json());

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
  res.send("hi");
});

app.use("/", authRouter);

io.on("connection", (socket) => {

});

