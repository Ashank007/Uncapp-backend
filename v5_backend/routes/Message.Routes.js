import express from "express";
import { GetUnreadMessages, GetUserMessages } from "../controllers/Message.controller.js";

const MessageRouter = express.Router();

MessageRouter.get("/unread/:receiverId",GetUnreadMessages)
MessageRouter.get("/:user1/:user2",GetUserMessages);
export default MessageRouter;
