import express from "express";
import { GetUserMessages } from "../controllers/Message.controller.js";

const MessageRouter = express.Router();

MessageRouter.get("/:user1/:user2",GetUserMessages);

export default MessageRouter;
