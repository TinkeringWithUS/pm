import { Router } from "express";

const docRouter = Router();

// https://stackoverflow.com/questions/630453/what-is-the-difference-between-post-and-put-in-http
// tldr; 
// post is not idempotent (stateful)
// while put is idempotent (stateless)
// want one to create a document 
// REST API with docIds?
docRouter.post("/", (req, res) => {

});

export { docRouter };

