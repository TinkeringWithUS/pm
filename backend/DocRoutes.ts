import { Router, json } from "express";
import { RealTimeDoc } from "./RealTimeDoc";

const docRouter = Router();

// const documentToDocname = new Map();
// const docnameToDocument = new Map();

// const userIdToUser = new Map();

// initialize these guys

// https://stackoverflow.com/questions/630453/what-is-the-difference-between-post-and-put-in-http
// tldr; 
// post is not idempotent (stateful)
// while put is idempotent (stateless)
// want one to create a document 
// REST API with docIds?

// uh bad idea to use docname 
// docid then? don't want to allow 
const docnameToDocument = new Map();

docnameToDocument.set("test", new RealTimeDoc("test"));


// TODO: WIP
// docRouter.put("/:docname", (req, res) => {
//   const docname = req.params.docname;

//   // create a document if needed
//   if(!documentToDocname.has(docname)) {
//     // create document
//     docnameToDocument.set(docname, new RealTimeDoc(docname));
//   } else {
//     // send back response, already created
//     res.send("Success");
//   }
// });

// docRouter.get("/:docid", (req, res) => {
//   const docid = req.params.docid;

//   if(!documentToDocname.has(docid)) {
//     // don't have this document, send back error code
//     // not found 
//     res.status(404).send("Document not found");
//   } else {
//     // otherwise, we have the document

//   }
// });

/**
 * 1. user wants a document
 *  a. check if user has perms
 *  b. is user authenticated
 * 2. is user active or inactive? 
 *  a. if inactive, make user active 
 *  b. if active, just send back it's alright request
 *  
 * 3. if user sends post request, create document 
 *  a. requires userid and docname
 *  b. generate docid 
 */

export { docRouter };

