import express from "express";
import {CreateStory, GetAllUserStory,GetStory } from "../controllers/Story.controller.js";
import isauthenticated from "../middlewares/isauthenticated.js";
const StoryRouter = express.Router();

StoryRouter.post("/create",isauthenticated,CreateStory);
StoryRouter.get("/get",isauthenticated,GetAllUserStory);
StoryRouter.get("/:id",isauthenticated,GetStory);
export default StoryRouter;
