import { NextFunction, Request, Response } from "express";
import { SESSION_COOKIE } from "../../shared/networkInterface";
import { PrismaClient } from "@prisma/client";

// TODO: fix session based authentication by replacing 
// localstorage with cookies (useAuthFetch hook for client side)

function createVerifyMiddlware(dbClient: PrismaClient) {
  return function verifySession(req: Request, res: Response, next: NextFunction) {
    const cookie = req.headers.cookie;

    if (!cookie) {
      // send auth error
      sendAuthError(res);
      return;
    }

    const pairings = cookie.split("; ");

    const sessionPairing = pairings.find((pairing) => {
      if (pairing.includes(SESSION_COOKIE)) {
        return pairing;
      }
    });

    if (!sessionPairing) {
      // send auth error
      sendAuthError(res);
      return;
    }

    const sessionToken = sessionPairing.split("=")[1];

    // TODO: current algorithm is O(N) time, can be better
    // maybe use an in memory database?
    dbClient.user.findFirst({
      where: {
        activeSessionToken: sessionToken
      }
    })
      .then((user) => {
        if (user) {
          next();
        } else {
          sendAuthError(res);
          return;
        }
      });
  }
}

function sendAuthError(res: Response) {
  res.send("");
}


export { createVerifyMiddlware };