import mongoose from 'mongoose'

const PostSchema = new mongoose.Schema(
 {
  createdby: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comments: [
   {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    timestamp:{type:Date,default:Date.now}
   }
  ],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  totallikes: { type: Number },
  description: { type: String },
  media: [{ type: String }],
  timestamp:{type:Date,default:Date.now}
 },
 { versionKey: false }
)

const Post = mongoose.model('Post', PostSchema)

export default Post
