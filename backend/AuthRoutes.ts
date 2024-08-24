import fs from "fs/promises";

import { Router } from "express";


import {
  authResponse,
  authValues,
  loginInfo,
  loginResponse
} from "../shared/networkInterface";

import { createUniqueUser, loadAllUsers, User } from "./User";
import { PrismaClient } from "@prisma/client";

const authRouter = Router();

const prisma = new PrismaClient();

let usernamesToUsers = new Map<string, User>();


loadAllUsers(prisma)
  .then((namesToUser) => {
    usernamesToUsers = namesToUser;
  })
  .catch(() => {
    console.log("Failure, cannot load users from database.");
  });

// async function updateAuthFile(filepath: string, newUser: authValues) {
//   const userLine: string = `${newUser.username}:${newUser.password}\n`;
//   await fs.writeFile(filepath, userLine, { flag: "a" });
// }

authRouter.post("/register", (req, res) => {
  const registerInfo: authValues = req.body;

  const result: authResponse = {
    registered: false,
    sessionToken: "",
  };

  createUniqueUser(registerInfo.username, registerInfo.password, prisma)
    .then((user) => {
      if (!user) {
        return;
      } else {
        usernamesToUsers.set(registerInfo.username, user);
        return user.registerUser(prisma);
      }
    })
    .then((sessionToken) => {
      if (!sessionToken) {
        res.send(JSON.stringify(result));
      } else {
        result.sessionToken = sessionToken;
        result.registered = true;
        res.send(JSON.stringify(result));
      }
    });
});



authRouter.post("/signin", (req, res) => {
  const signInInfo: authValues = req.body;

  const signInResponse: authResponse = {
    registered: false,
    sessionToken: ""
  };

  console.log("/signin. usernames: " + [...usernamesToUsers.keys()]);

  const user = usernamesToUsers.get(signInInfo.username);

  if (!user) {
    console.log("/signin, no user: ");
    res.send(JSON.stringify(signInResponse));
    return;
  }

  // if (!user || user.signIn(signInInfo.password) === "") {
  //   res.send(JSON.stringify(signInResponse));
  //   return;
  // }

  user.signIn(signInInfo.password, prisma)
    .then((activeSessionToken) => {
      if (activeSessionToken) {
        console.log("successful sign in");
        signInResponse.sessionToken = activeSessionToken;
        signInResponse.registered = true;
      }
    })
    .finally(() => {
      console.log("in finally clause");
      res.send(JSON.stringify(signInResponse));
    });

  // updateUserFile(USER_FILE, user, signInInfo.username);
});

authRouter.post("/login", async (req, res) => {

  const loginInfo: loginInfo = req.body;

  console.log(JSON.stringify(loginInfo));
  console.log("login info username: " + loginInfo.username);

  const user = usernamesToUsers.get(loginInfo.username);

  const loginResponse: loginResponse = {
    loggedIn: false,
    profilePicture: null,
  };

  console.log("/login. username: " + loginInfo.username + ".");
  console.log("keys");
  console.log([...usernamesToUsers.keys()]);

  if (user) {
    console.log("has user");
    // TODO: if not logged in, return false login response
    user.isLoggedIn(loginInfo.sessionToken);
    loginResponse.loggedIn = true;

    const files = await fs.readdir("./profile_pictures");

    for (const file of files) {
      if (file.includes(loginInfo.username)) {
        const imgPath = "./profile_pictures/" + file;

        console.log("img path: " + imgPath);

        const profilePictureBuffer = await fs.readFile(imgPath);
        loginResponse.profilePicture = new Blob([profilePictureBuffer]);
        break;
      }
    }
  }

  console.log("login response pfp: " + loginResponse.profilePicture);

  console.log(JSON.stringify(loginResponse));

  res.send(JSON.stringify(loginResponse));
});

export { authRouter, usernamesToUsers };


