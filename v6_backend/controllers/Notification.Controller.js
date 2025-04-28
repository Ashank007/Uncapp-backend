import User from '../models/User.js'
import HandleResponse from '../utils/HandleResponse.js'
import HandleError from '../utils/HandleError.js'
import Notification from '../models/Notification.js'

const FetchAllNotifications = async (req,res) => {
try {
   const userid = req.user.data || req.user.id;

   const notifications = await Notification.find({ to: userid }).populate('from', 'username avatar')
  .populate('to', 'username avatar').populate('postid', 'title content').sort({ timestamp: -1 }).exec();

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

export {FetchAllNotifications,MarkSeenNotification,MarkAllNotificationSeen,GetNotificationsCount}
