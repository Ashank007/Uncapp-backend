import HandleResponse from '../utils/HandleResponse.js'
import HandleError from '../utils/HandleError.js'
import Message from '../models/Message.js';

const GetUserMessages = async (req,res) => {
try {
  const { user1, user2 } = req.params;

  const { page = 1, limit = 20 } = req.query; 

  const messages = await Message.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 },
      ],
    })
      .sort({ timestamp: -1 })     
      .skip((page - 1) * limit)			
      .limit(parseInt(limit));


   HandleResponse(res,true,messages,200);
} catch (error) {
   HandleError(res,false,error.message,500);	
}
}
const GetUnreadMessages = async (req,res) => {
 try {
   const { receiverId } = req.params;
   const unreadMessages = await Message.find({
      receiverId,
      status: 'sent'
    });
   const grouped = unreadMessages.reduce((acc, msg) => {
      acc[msg.senderId] = (acc[msg.senderId] || 0) + 1;
      return acc;
    }, {});

   HandleResponse(res,true,grouped,200);
 } catch (error) {
   HandleError(res,false,error.message,500);	
 }

}
export {GetUserMessages,GetUnreadMessages};
