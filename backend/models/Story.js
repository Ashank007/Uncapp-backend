import mongoose from 'mongoose'

const StorySchema = new mongoose.Schema(
 {
  createdby: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  mediaUrl: { type: String},
  views: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now},
  isarchived: {type:Boolean,default:false},
 },
 { versionKey: false }
)

const Story = mongoose.model('Story', StorySchema);

export default Story
