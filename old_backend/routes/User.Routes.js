import express from 'express'
import { EditProfile, GetProfileDetails,GetEmailNameAvatar, Login, Register, FollowUser, AddAchievement, DeleteAchievement, EditAchievement, GetAllUsers, GetUserByUsername,GoogleLogin, GetProfileDetailsByUsername, AddClub, DeleteClub,EditClub, GetProfileName} from '../controllers/User.Controller.js'
import isauthenticated from '../middlewares/isauthenticated.js'
const UserRouter = express.Router()
UserRouter.post('/register', Register)
UserRouter.post('/googlelogin',GoogleLogin);
UserRouter.post('/login', Login)
UserRouter.get('/get/:username',isauthenticated,GetUserByUsername);
UserRouter.get('/data', isauthenticated, GetEmailNameAvatar)
UserRouter.get('/profile', isauthenticated, GetProfileDetails)
UserRouter.get('/profile/id/:id',GetProfileName);
UserRouter.get('/profile/:username', isauthenticated, GetProfileDetailsByUsername)
UserRouter.put('/edit', isauthenticated, EditProfile)
UserRouter.get('/follow/:id', isauthenticated, FollowUser)
UserRouter.post('/club',isauthenticated,AddClub);
UserRouter.delete('/club',isauthenticated,DeleteClub);
UserRouter.put("/club",isauthenticated,EditClub);
UserRouter.post('/achievement', isauthenticated, AddAchievement)
UserRouter.delete('/achievement',isauthenticated,DeleteAchievement)
UserRouter.put("/achievement",isauthenticated,EditAchievement);
UserRouter.get("/all",isauthenticated,GetAllUsers);
export default UserRouter
