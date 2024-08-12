import fs from "fs/promises";

import { Router } from "express";

import multer from "multer";


const profileRouter = Router();

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./profile_pictures");
  }, 

  filename: (req, file, cb) => {
    console.log("file original name (lower case): " + file.originalname.toLowerCase());

    const filename = file.originalname;

    cb(null, filename);
  }
})

const uploadProfilePictures = multer({
  storage: profileStorage,
});


// profileRouter.post("/uploadimg", (req, res) => {
//   const profilePicture : File =  req.body;

  
// });

profileRouter.post("/upload_profile", uploadProfilePictures.single("file"), (req, res) => {
  console.log(req.body);
  console.log(req.params);
  res.send("File gotten");
});


export { profileRouter };


