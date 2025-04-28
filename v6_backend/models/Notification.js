import mongoose from 'mongoose'

const NotificationSchema = new mongoose.Schema(
 {
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  postid: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  message: {
   type: String
  },
  type: { type: String, enum: ['follow_request', 'like', 'comment', 'other'] },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', null], default: null },
  isseen:{type:Boolean,default:false},
  timestamp: { type: Date, default: Date.now, index: true }
 },
 { versionKey: false }
)

const Notification = mongoose.model('Notification', NotificationSchema)

export default Notification
