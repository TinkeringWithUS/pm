import fs from "fs/promises";

import express, { json } from "express";
import { createServer } from "http";
import { Server } from "socket.io";

import cors from "cors";

import {
  authValues
} from "../shared/networkInterface";

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

const registeredUsers = new Set<string>();

syncRegisteredUsers("./password.txt", registeredUsers);

async function syncRegisteredUsers(filepath: string, registeredUsers: Set<string>) {
  const data = await fs.readFile(filepath);

  const dataString = data.toString();
  const namePasswordPairs = dataString.split("\n");

  // format is username:password
  for(const pair of namePasswordPairs) {
    const namePassPair = pair.split(":")
    registeredUsers.add(namePassPair[0]);
  }
}

async function updateAuthFile(filepath: string, newUser: authValues,) {
  const userLine : string = `${newUser.username}:${newUser.password}\n`;
  await fs.writeFile(filepath, userLine, {flag: "a"});
} 


app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
  res.send("hi");
});

app.post("/register", (req, res) => {
  const registerInfo : authValues = req.body;

  console.log("received in /auth. user: " + registerInfo.username +
    ". pass: " + registerInfo.password
  );

  console.log(req.body);

  // TODO: 
  // for now, write it to a file, but eventually 
  // we want to put password and emails into 
  // either mongodb (and store other user related 
  // stuff) or in sql db (supabase)
  const result = {
    registered: true
  };

  if(registeredUsers.has(registerInfo.username)) {
    result["registered"] = false;
    res.send(JSON.stringify(result));
    console.log("already registered");
    return;
  }

  updateAuthFile( "./password.txt", registerInfo);
  registeredUsers.add(registerInfo.username);

  res.send(JSON.stringify(result));
});

io.on("connection", (socket) => {

});

