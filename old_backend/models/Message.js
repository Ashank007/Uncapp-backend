import mongoose from 'mongoose'
const MessageSchema = new mongoose.Schema(
	{
		senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		message: {
			type: String
		},
		timestamp: { type: Date, default: Date.now,index:true}
	},
	{ versionKey: false }
)

MessageSchema.index({ senderid: 1, receiverid: 1, timestamp: -1 });

const Message = mongoose.model('Message', MessageSchema)

export default Message
