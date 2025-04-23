import User from '../models/User.js'
import HandleResponse from '../utils/HandleResponse.js'
import HandleError from '../utils/HandleError.js'
import Notification from '../models/Notification.js'

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

export {SendFollowRequest,CancelFollowRequest,AcceptFollowRequest,RejectFollowRequest,UnfollowUser}
