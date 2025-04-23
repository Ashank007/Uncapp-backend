import express from 'express';
import { AddComment, CreatePost, EditPost, GetAllSavePost, GetAllUserFollowingPost, GetAllUserPost, GetComments, GetPost, LikePost, SavePost} from '../controllers/Post.Controller.js';
import isauthenticated from '../middlewares/isauthenticated.js';
const PostRouter = express.Router();

PostRouter.post("/create",isauthenticated,CreatePost);
PostRouter.put("/edit",isauthenticated,EditPost);
PostRouter.get("/all",isauthenticated,GetAllUserPost);
PostRouter.get("/like/:id",isauthenticated,LikePost);
PostRouter.get("/savepost/:id",isauthenticated,SavePost);
PostRouter.get("/get/savedposts",isauthenticated,GetAllSavePost);
PostRouter.post("/add/comment/:id",isauthenticated,AddComment)
PostRouter.get("/get/comments/:id",isauthenticated,GetComments)
PostRouter.get("/get/follow",isauthenticated,GetAllUserFollowingPost)
PostRouter.get("/:id",isauthenticated,GetPost);
export default PostRouter;
