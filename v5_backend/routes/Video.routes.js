import express from 'express'
import isauthenticated from '../middlewares/isauthenticated.js'
import { UploadVideo, GetAllUserVideos, LikeVideo } from '../controllers/Video.Controller.js'
const VideoRouter = express.Router()

VideoRouter.post('/add/video', isauthenticated, UploadVideo)
VideoRouter.get('/get/videos', isauthenticated, GetAllUserVideos)
VideoRouter.post('/like/:id', isauthenticated, LikeVideo)

export default VideoRouter
