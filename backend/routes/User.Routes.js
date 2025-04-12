import express from 'express'

import { EditProfile, GetProfileDetails,GetEmailNameAvatar, Login, Register, SendFollowRequest, GetAllUsers, GetUserByUsername,GoogleLogin, GetProfileDetailsByUsername, GetProfileName, AcceptFollowRequest, RejectFollowRequest, FetchAllNotifications, CancelFollowRequest, UnfollowUser, MarkSeenNotification, MarkAllNotificationSeen, GetNotificationsCount} from '../controllers/User.Controller.js'

import { AddClub,DeleteClub,EditClub,AddAchievement,DeleteAchievement,EditAchievement } from '../controllers/Club_Achievement.Controller.js'

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
UserRouter.get('/follow/accept/:id/:notificationid', isauthenticated, AcceptFollowRequest)
UserRouter.get('/follow/reject/:id/:notificationid', isauthenticated, RejectFollowRequest)
UserRouter.get('/follow/:id', isauthenticated, SendFollowRequest)
UserRouter.get('/unfollow/:id', isauthenticated,UnfollowUser)
UserRouter.delete('/follow/cancel/:id', isauthenticated, CancelFollowRequest)
UserRouter.get('/notifications',isauthenticated,FetchAllNotifications)
UserRouter.post('/club',isauthenticated,AddClub);
UserRouter.delete('/club',isauthenticated,DeleteClub);
UserRouter.put("/club",isauthenticated,EditClub);
UserRouter.post('/achievement', isauthenticated, AddAchievement)
UserRouter.delete('/achievement',isauthenticated,DeleteAchievement)
UserRouter.put("/achievement",isauthenticated,EditAchievement);
UserRouter.get("/all",isauthenticated,GetAllUsers);
UserRouter.put("/notification/seen/:notificationid",isauthenticated,MarkSeenNotification);
UserRouter.put("/notifications/seen/all",isauthenticated,MarkAllNotificationSeen);
UserRouter.get("/notifications/count",isauthenticated,GetNotificationsCount);
export default UserRouter

