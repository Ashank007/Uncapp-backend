import express from "express";
import passport from "passport";
import { HandleGoogleAuth, HandleGoogleAuthCallback } from "../controllers/Google.Controller.js";

const GoogleRouter = express.Router();

GoogleRouter.get("/google",HandleGoogleAuth);
GoogleRouter.get("/google/callback",passport.authenticate("google", { failureRedirect: "exp://172.20.10.6:8081/--/index" }),HandleGoogleAuthCallback);
export default GoogleRouter;
