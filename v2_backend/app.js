import express from 'express';
import { Server } from "socket.io";
import http from "http";
import session from 'express-session';
import dotenv from 'dotenv';
import passport from 'passport';
import ConnectDB from './config/ConnectDb.js';
import InitializePassport from './utils/Passport.js';
import GoogleRouter from './routes/Google.Routes.js';
import PostRouter from './routes/Post.Routes.js';
import UserRouter from './routes/User.Routes.js';
import StoryRouter from './routes/Story.Routes.js';
import MessageRouter from './routes/Message.Routes.js';
import handleSocketEvents from './controllers/Socket.controller.js';
import requestLogger from './utils/Logger.js';

dotenv.config();

ConnectDB();

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL, 
    credentials: true
  }
});

handleSocketEvents(io);

app.use(express.json());
app.use(requestLogger);
InitializePassport();
app.use(session({secret: process.env.JWT_SECRET,resave: false,saveUninitialized: true,}));
app.use(passport.initialize());
app.use(passport.session());
app.use("/api/v1/auth",GoogleRouter);
app.use("/api/v1/post",PostRouter);
app.use("/api/v1/user",UserRouter);
app.use("/api/v1/story",StoryRouter);
app.use("/api/v1/message",MessageRouter);
export {io,server};
