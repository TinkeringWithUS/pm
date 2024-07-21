import fs from "fs/promises";

import { Router } from "express";


import {
  authResponse,
  authValues,
  loginInfo,
  loginResponse
} from "../shared/networkInterface";

import { User, userJson } from "./User";

const authRouter = Router();

type usersFileStorage = {
  users: userJson[]
};


const usernamesToUsers = new Map<string, User>();
const registeredUsernames = new Set<string>();
const usernamesToPassword = new Map<string, string>();

const fileUsersJson: usersFileStorage = {
  users: []
};

const usernameToIndex = new Map<string, number>();

async function loadUserRecords(filepath: string) {
  const data = await fs.readFile(filepath, "utf-8").catch(() => { return null; });

  if (!data) {
    return;
  }

  const userRecords: usersFileStorage = JSON.parse(data);

  // TODO: take all the user info and meta info from disk and update 
  // memory structures with it
  const records = userRecords.users;

  for (let userJsonIndex = 0; userJsonIndex < records.length; userJsonIndex++) {
    const userJson = records[userJsonIndex];

    const newUser = new User(userJson.username, userJson.password,
      userJson.loginTime, userJson.activeSessionToken, userJson.chatRoomNames);

    registeredUsernames.add(userJson.username);

    usernamesToUsers.set(userJson.username, newUser);
    usernamesToPassword.set(userJson.username, userJson.password);
    usernameToIndex.set(userJson.username, userJsonIndex);

  }

  console.log("after load user records. usernameToIndex");
  console.log([...usernameToIndex.entries()])

  fileUsersJson.users = records;
}

// TODO: Investigate a data structure that doesn't shift values when 
// values are removed, instead, append. when certain threshold hit, 
// should do a compact (amortizing removal) (will be an array with holes
// use hashmap to track these holes)
async function updateUserFile(filepath: string, userToUpdate: User, username: string) {

  console.log("in update user file");

  const userJson = userToUpdate.json();

  let userIndex = usernameToIndex.get(username);

  if (userIndex) {
    // update   
    fileUsersJson.users[userIndex] = userJson;
  } else {
    // add new user 
    const currentNumUsers = fileUsersJson.users.length;
    fileUsersJson.users.push(userJson);
    usernameToIndex.set(username, currentNumUsers);
  }

  console.log("update user file.");
  console.log(JSON.stringify(fileUsersJson));

  let writeFlag = "w";

  // file doesn't exist, create it 
  if (!fs.stat(filepath)) {
    writeFlag = "w+";
  }

  await fs.writeFile(filepath, JSON.stringify(fileUsersJson, null, "\t"), { flag: writeFlag });
}

// const sessionTokensToTime = new Map<string, Date>();

const USER_FILE = "./users.json";
const PASSWORD_FILE = "./password.txt";

// TODO: make sure to write down the user info (e.g. rooms, active session token)
// TODO: rename to something else lol
loadUserRecords(USER_FILE);
loadAuthRecords(PASSWORD_FILE, registeredUsernames);

async function loadAuthRecords(filepath: string, registeredUsers: Set<string>) {

  const data = await fs.readFile(filepath).catch(() => { return null; });

  if (!data) {
    return;
  }

  const dataString = data.toString();
  const namePasswordPairs = dataString.split("\n");

  // format is username:password
  for (const pair of namePasswordPairs) {
    const namePassPair = pair.split(":")

    const username = namePassPair[0];
    const password = namePassPair[1];

    registeredUsers.add(username);
    usernamesToPassword.set(username, password);

    const user = new User(username, password);

    registeredUsernames.add(username);
    usernamesToUsers.set(username, user);
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
  const result: authResponse = {
    registered: false,
    sessionToken: "",
  };

  if (registeredUsernames.has(registerInfo.username)) {
    res.send(JSON.stringify(result));
    return;
  }

  updateAuthFile(PASSWORD_FILE, registerInfo);

  const user = new User(registerInfo.username, registerInfo.password);

  updateUserFile(USER_FILE, user, registerInfo.username);

  registeredUsernames.add(registerInfo.username);
  usernamesToUsers.set(registerInfo.username, user);

  result.sessionToken = user.registerUser();
  result.registered = true;

  res.send(JSON.stringify(result));
});

authRouter.post("/signin", (req, res) => {
  const signInInfo: authValues = req.body;

  const signInResponse: authResponse = {
    registered: false,
    sessionToken: ""
  };

  const user = usernamesToUsers.get(signInInfo.username);

  if (!user || user.signIn(signInInfo.password) === "") {
    res.send(JSON.stringify(signInResponse));
    return;
  }

  signInResponse.sessionToken = user.signIn(signInInfo.password);
  signInResponse.registered = true;

  updateUserFile(USER_FILE, user, signInInfo.username);

  res.send(JSON.stringify(signInResponse));
});

authRouter.post("/login", (req, res) => {

  const loginInfo: loginInfo = req.body;

  console.log(JSON.stringify(loginInfo));
  console.log("login info username: " + loginInfo.username);

  const user = usernamesToUsers.get(loginInfo.username);

  const loginResponse: loginResponse = {
    loggedIn: false
  };

  console.log("/login. username: " + loginInfo.username + ".");
  console.log("keys");
  console.log([...usernamesToUsers.keys()]);

  if (user) {
    console.log("has user");
    user.isLoggedIn(loginInfo.sessionToken);
    loginResponse.loggedIn = true;
  }

  res.send(JSON.stringify(loginResponse));
});

export { authRouter, usernamesToUsers };


