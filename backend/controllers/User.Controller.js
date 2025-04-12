import User from '../models/User.js'
import bcrypt from 'bcrypt'
import GenerateToken from '../utils/GenerateToken.js'
import ValidateBody from '../utils/ValidateBody.js'
import {FindUserById,FindUserByUsername,FindUserByEmail, FindUserByUsernameRegex} from '../utils/FindingFunctions.js'
import HandleResponse from '../utils/HandleResponse.js'
import HandleError from '../utils/HandleError.js'
import Notification from '../models/Notification.js'

const Register = async (req, res) => {
 try {
  if (!ValidateBody(['fullname', 'email', 'password','username'], req.body, res)) return

  const { fullname, email, password,username } = req.body

 const existinguser = await FindUserByEmail(email)

  if (existinguser) return HandleResponse(res, false, 'User Already Exits', 409)

  const hashedPassword = await bcrypt.hash(password, 10)

  await User.create({ fullname: fullname, email: email, password: hashedPassword ,username:username})

  HandleResponse(res, true, 'User Registered Successfully', 201)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const GoogleLogin = async (req, res) => {
 try {
  if (!ValidateBody(['fullname', 'email', 'password','username'], req.body, res)) return

  const { fullname, email, password,username } = req.body

  const existinguser = await FindUserByEmail(email)

  if (!existinguser) return HandleResponse(res, false, 'User Not Found', 409)

  const hashedPassword = await bcrypt.hash(password, 10)
  
  existinguser.fullname = fullname;
  existinguser.password = hashedPassword;
  existinguser.username = username;
  await existinguser.save();

  const token = GenerateToken(existinguser._id)

  HandleResponse(res, true, token, 200);
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const Login = async (req, res) => {
 try {
  if (!ValidateBody(['email', 'password'], req.body, res)) return

  const { email, password } = req.body

  const existinguser = await FindUserByEmail(email)

  if (!existinguser) return HandleResponse(res, false, 'User Not Found', 404)

  const ismatched = await bcrypt.compare(password, existinguser.password)

  if (!ismatched) return HandleResponse(res, false, 'Incorrect Password Entered', 400)

  const token = GenerateToken(existinguser._id)

  HandleResponse(res, true, token, 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const EditProfile = async (req, res) => {
 try {
  const id = req.user.data || req.user.id;

  const user = await FindUserById(id, '-password -createdAt')

  if (!user) return HandleResponse(res, false, 'User Not Found', 404)
  ;['fullname', 'accounttype', 'bio', 'avatar', 'bannerphoto'].forEach(field => {
   if (req.body[field] !== undefined) user[field] = req.body[field]
  })

  await user.save()

  const { _id, ...userData } = user.toObject({ versionKey: false })

  HandleResponse(res, true, userData, 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const GetEmailNameAvatar = async (req, res) => {
 try {
  const id = req.user.data || req.user.id;

  const user = await FindUserById(id, '-password -createdAt')

  if (!user) return HandleResponse(res, false, 'User Not Found', 404)

  const data = { fullname: user.fullname, email: user.email, avatar: user.avatar }

  HandleResponse(res, true, data, 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const GetProfileDetails = async (req, res) => {
 try {
  const id = req.user.data || req.user.id;

  const user = await FindUserById(id, '-password -createdAt', ['posts'])

  if (!user) return HandleResponse(res, false, 'User Not Found', 404)

  const data = {
   id: user._id,
   fullname: user.fullname,
   avatar: user.avatar,
   followers: user.followers.length,
   following: user.following.length,
   postlength: user.posts.length,
   post: user.posts,
   bio: user.bio,
   bannerphoto: user.bannerphoto,
   accounttype: user.accounttype,
   achievements: user.achievements,
   clubs:user.clubs
  }

  HandleResponse(res, true, data, 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const GetProfileName = async (req, res) => {
 try {
  const id = req.params.id;

  const user = await FindUserById(id,'');

  if (!user) return HandleResponse(res, false, 'User Not Found', 404)

  const data = {
   id: user._id,
   fullname:user.fullname
  }
  HandleResponse(res, true, data, 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const GetProfileDetailsByUsername = async (req, res) => {
 try {
  const id = req.user.data || req.user.id;

  const mainuser = await FindUserById(id);

  if (!ValidateBody(['username'], req.params, res)) return;

  const { username } = req.params;

  const user = await User.findOne({username:username}).populate("posts"); 

  if (!user) return HandleResponse(res, false, 'User Not Found', 404);

  const isFollowing = user.followers.includes(mainuser._id);

  const hasSentFollowRequest = mainuser.sentfollowrequests.some(
    r => r.userid.toString() === user._id.toString()
  );

  const data = {
   _id: user._id,
   username: user.username,
   fullname: user.fullname,
   avatar: user.avatar,
   followers: user.followers.length,
   following: user.following.length,
   numposts: user.posts.length,
   bio: user.bio,
   isFollowing: isFollowing,
   hasSentFollowRequest: hasSentFollowRequest,
   posts:user.posts
   };

  HandleResponse(res, true, data, 200);
 } catch (error) {
  HandleError(res, false, error.message, 500);
 }
};


const SendFollowRequest = async (req, res) => {
  try {

    const userId = req.user.data || req.user.id;

    const targetId = req.params.id;

    if (userId === targetId) {
      return HandleResponse(res, false, 'You cannot follow yourself', 400);
    }

    const [user, targetUser] = await Promise.all([
      User.findById(userId),
      User.findById(targetId),
    ]);

    if (!user || !targetUser) {
      return HandleResponse(res, false, 'User Not Found', 404);
    }

    const isFollowing = user.following.includes(targetId);

    if (isFollowing) {
      return HandleResponse(res, false, 'Already following this user', 400);
    }

    const alreadySent = user.sentfollowrequests.find(r => r.userid.toString() === targetId);
     
    if (alreadySent) {
    return HandleResponse(res,false,"Follow request already sent",400);
  }
    const today = new Date();
    
    const requestsToday = user.sentfollowrequests.filter(req => {
    return new Date(req.sentAt).toDateString() === today.toDateString();
  });

    if (requestsToday.length >= 5) {
    return HandleResponse(res,false,"Daily Follow Request Limit Reached",429);
  }

    const notification = await Notification.create({from:user._id,to:targetUser._id,type:"follow_request",message:`${user.fullname} requested to follow you`,status:'pending'})

    user.sentfollowrequests.push({ userid: targetId });
    targetUser.followrequests.push(userId);
    targetUser.notifications.push(notification._id);

    await user.save();
    await targetUser.save();
    
    HandleResponse(res,true,"Follow Request Sent",200);
  } catch (error) {
    HandleError(res, false, error.message, 500);
  }
};

const CancelFollowRequest = async (req, res) => {
  try {
    const userId = req.user.data || req.user.id;
    const targetId = req.params.id;

    if (userId === targetId) {
      return HandleResponse(res, false, 'You cannot cancel a request to yourself', 400);
    }

    const [user, targetUser] = await Promise.all([
      User.findById(userId),
      User.findById(targetId),
    ]);

    if (!user || !targetUser) {
      return HandleResponse(res, false, 'User Not Found', 404);
    }

    const sentRequestIndex = user.sentfollowrequests.findIndex(
      (r) => r.userid.toString() === targetId
    );

    if (sentRequestIndex === -1) {
      return HandleResponse(res, false, 'No follow request to cancel', 400);
    }

    const notification = await Notification.findOneAndDelete({
      from: userId,
      to: targetId,
      type: "follow_request",
      status: "pending",
    });

    if (notification) {
      targetUser.notifications = targetUser.notifications.filter(
        (id) => id.toString() !== notification._id.toString()
      );
    }
    user.sentfollowrequests.splice(sentRequestIndex, 1);

    targetUser.followrequests = targetUser.followrequests.filter(
      (id) => id.toString() !== userId
    );

    await Promise.all([user.save(), targetUser.save()]);

    HandleResponse(res, true, 'Follow Request Cancelled Successfully', 200);
  } catch (error) {
    HandleError(res, false, error.message, 500);
  }
};

const AcceptFollowRequest = async (req, res) => {
  try {
    const userId = req.user.data || req.user.id;
    const requesterId = req.params.id;
    const notificationid = req.params.notificationid;

    if (userId === requesterId) {
      return HandleResponse(res, false, 'You cannot follow yourself', 400);
    }

    const [user, requester] = await Promise.all([
      User.findById(userId),
      User.findById(requesterId),
    ]);

    if (!user || !requester) {
      return HandleResponse(res, false, 'User Not Found', 404);
    }

    const requestExists = user.followrequests.includes(requesterId);

    if (!requestExists) {
      return HandleResponse(res, false, 'No follow request found from this user', 400);
    }

    await Notification.findByIdAndUpdate(notificationid,{status:"accepted"});

    const notification = await Notification.create({from:userId,to:requesterId,message:`${user.fullname} has accepted your Follow Request`,type:'other',status:'accepted'})

    user.followers.push(requesterId);

    requester.following.push(userId);

    requester.notifications.push(notification._id);

    user.followrequests = user.followrequests.filter(id => id.toString() !== requesterId);

    requester.sentfollowrequests = requester.sentfollowrequests.filter(
      req => req.userid.toString() !== userId
    );

    await user.save();
    await requester.save();

    return HandleResponse(res, true, 'Follow request accepted', 200);
  } catch (error) {
    HandleError(res, false, error.message, 500);
  }
};

const RejectFollowRequest = async (req, res) => {
  try {
    const userId = req.user.data || req.user.id;
    const requesterId = req.params.id;
    const notificationid = req.params.notificationid;

    if (userId === requesterId) {
      return HandleResponse(res, false, 'You cannot follow yourself', 400);
    }

    const [user, requester] = await Promise.all([
      User.findById(userId),
      User.findById(requesterId),
    ]);

    if (!user || !requester) {
      return HandleResponse(res, false, 'User Not Found', 404);
    }

    const requestExists = user.followrequests.includes(requesterId);

    if (!requestExists) {
      return HandleResponse(res, false, 'No follow request found from this user', 400);
    }

    await Notification.findByIdAndUpdate(notificationid,{status:"rejected"});
	
   const notification = await Notification.create({from:userId,to:requesterId,message:`${user.fullname} has rejected your Follow Request`,type:'other',status:'rejected'})

    user.followrequests = user.followrequests.filter(id => id.toString() !== requesterId);
    requester.sentfollowrequests = requester.sentfollowrequests.filter(
      req => req.userid.toString() !== userId
    );

    requester.notifications.push(notification._id);

    await user.save();
    await requester.save();

    return HandleResponse(res, true, 'Follow request rejected', 200);
  } catch (error) {
    HandleError(res, false, error.message, 500);
  }
};

const UnfollowUser = async (req, res) => {
  try {
    const userId = req.user.data || req.user.id;
    const targetId = req.params.id;

    if (userId === targetId) {
      return HandleResponse(res, false, 'You cannot unfollow yourself', 400);
    }

    const [user, targetUser] = await Promise.all([
      User.findById(userId),
      User.findById(targetId),
    ]);

    if (!user || !targetUser) {
      return HandleResponse(res, false, 'User not found', 404);
    }

    const isFollowing = user.following.includes(targetId);
    const isFollower = targetUser.followers.includes(userId);

    if (!isFollowing || !isFollower) {
      return HandleResponse(res, false, 'You are not following this user', 400);
    }

    user.following = user.following.filter(id => id.toString() !== targetId);
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== userId);

    await Promise.all([user.save(), targetUser.save()]);

    HandleResponse(res, true, 'Unfollowed successfully', 200);
  } catch (error) {
    HandleError(res, false, error.message, 500);
  }
};

const FetchAllNotifications = async (req,res) => {
try {
   const userid = req.user.data || req.user.id;

   const notifications = await Notification.find({ to: userid })
  .populate('from', 'username avatar') // populate sender's data
  .populate('to', 'username avatar') // populate recipient's data
  .populate('postid', 'title content') // populate post details
  .sort({ timestamp: -1 }) // sort by newest first
  .exec();


   if(!notifications) return HandleResponse(res,false,"No Notifications Yet",400);

   HandleResponse(res,true,notifications,200);
 
} catch (error) {
    HandleError(res, false, error.message, 500);

}
}

const MarkSeenNotification = async (req,res) => {
try {
   const id = req.params.notificationid;
   const notification = await Notification.findById(id);
   if(notification.isseen)
   {
     notification.isseen = false;
     await notification.save();
     return HandleResponse(res,true,"Notification Marked as Unseen Successfully",200);
   }
   notification.isseen = true;

   await notification.save();

   HandleResponse(res,true,"Notification Marked as Seen Successfully",200);
} catch (error) {
    HandleError(res, false, error.message, 500);

}
}

const MarkAllNotificationSeen = async (req,res) => {
try {
   const id = req.user.data || req.user.id;

   const user = await User.findById(id);

   const notifications = user.notifications;

   await Promise.all(
    notifications.map((element) =>
    Notification.findByIdAndUpdate(element.toString(), { isseen: true }, { new: true })
   )
  );
   HandleResponse(res,true,"All Notification Marked as Seen",200);
} catch (error) {
    HandleError(res, false, error.message, 500);
}
}

const GetNotificationsCount = async (req,res) => {
try {	
   const id = req.user.data || req.user.id;

   const user = await User.findById(id).populate("notifications");

   const notifications = user.notifications;

   const count = notifications.filter((element) => element.isseen === false).length;

   HandleResponse(res,true,count,200);

} catch (error) {
    HandleError(res, false, error.message, 500);
}

}

const GetAllUsers = async (req, res) => {
 try {
  const userId = req.user.data || req.user.id;

  const user = await FindUserById(userId, '-password -createdAt')

  if (!user) return HandleResponse(res, false, 'User Not Found', 404)

  const users = await User.find({ _id: { $ne: userId } }).select('avatar fullname')

  HandleResponse(res, true, users, 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const GetUserByUsername = async (req, res) => {
  try {
    if (!ValidateBody(['username'], req.params, res)) return;

    const { username } = req.params;

    console.log(await User.find({}));

    const users = await FindUserByUsernameRegex(username);


    if (!users || users.length === 0) {
      return HandleResponse(res, false, "No users found", 404);
    }

    const data = users.map(user => ({
      _id: user._id,
      fullname: user.fullname,
      avatar: user.avatar,
      username: user.username
    }));

    HandleResponse(res, true, data, 200);
    
  } catch (error) {
    HandleError(res, false, error.message, 500);
  }
};

export { Register,GoogleLogin,Login, GetEmailNameAvatar, GetProfileDetails, EditProfile, SendFollowRequest,CancelFollowRequest,AcceptFollowRequest,RejectFollowRequest,GetAllUsers,GetUserByUsername,GetProfileDetailsByUsername,GetProfileName,FetchAllNotifications,UnfollowUser,MarkSeenNotification,MarkAllNotificationSeen,GetNotificationsCount}
