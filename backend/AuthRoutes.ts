import fs from "fs/promises";

import { Router } from "express";

import { randomBytes } from "crypto";

import {
  authValues,
  signInResponse
} from "../shared/networkInterface";

const authRouter = Router();

const registeredUsers = new Set<string>();
const usersToPassword = new Map<string, string>(); 
const sessionTokensToTime = new Map<string, Date>();

// TODO: rename to something else lol
syncAuthRecords("./password.txt", registeredUsers);

async function syncAuthRecords(filepath: string, registeredUsers: Set<string>) {
  const data = await fs.readFile(filepath);

  const dataString = data.toString();
  const namePasswordPairs = dataString.split("\n");

  // format is username:password
  for (const pair of namePasswordPairs) {
    const namePassPair = pair.split(":")
    registeredUsers.add(namePassPair[0]);
    usersToPassword.set(namePassPair[0], namePassPair[1]);
  }
}

async function updateAuthFile(filepath: string, newUser: authValues) {
  const userLine: string = `${newUser.username}:${newUser.password}\n`;
  await fs.writeFile(filepath, userLine, { flag: "a" });
}

authRouter.post("/register", (req, res) => {
  const registerInfo: authValues = req.body;

  // TODO: for now, write it to a file, 
  // but eventually we want to put password and 
  // emails into either mongodb (and store 
  // other user related stuff) or in sql db 
  // (supabase)
  // TODO: make sure to actually encrypt the 
  // password otherwise anybody can just 
  // break in
  const result = {
    registered: true
  };

  if (registeredUsers.has(registerInfo.username)) {
    result["registered"] = false;
    res.send(JSON.stringify(result));
    return;
  }

  updateAuthFile("./password.txt", registerInfo);
  registeredUsers.add(registerInfo.username);

  res.send(JSON.stringify(result));
});

authRouter.post("/signin", (req, res) => {
  const signInInfo: authValues = req.body;

  const signInResponse: signInResponse = { 
    sessionToken: ""
  };

  if (!registeredUsers.has(signInInfo.username) ||
    usersToPassword.get(signInInfo.username) !== signInInfo.password) {
    res.send(JSON.stringify(signInResponse));
    return;
  } 

  // generate a session token, track the time of creation 
  const TOKEN_LENGTH = 20; 
  // each byte = 2 characters
  // TODO: use Date.now()
  const sessionToken = randomBytes(TOKEN_LENGTH).toString("hex");
  sessionTokensToTime.set(sessionToken, new Date());

  signInResponse.sessionToken = sessionToken;

  res.send(JSON.stringify(signInResponse));
});

export {
  authRouter
};


