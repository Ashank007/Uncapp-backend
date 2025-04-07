import mongoose from 'mongoose'
const userSchema = new mongoose.Schema(
	{
		id: {
			type: String
		},
		fullname: {
			type: String
		},
		email: {
			type: String,
			required: true
		},
		bio: {
			type: String
		},
		username: {
			type: String
		},
		password: {
			type: String
		},
		accounttype: {
			type: String
		},
		createdAt: {
			type: Date,
			default: Date.now
		},
		stories: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Story'
			}
		],
		posts: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Post'
			}
		],
		avatar: {
			type: String
		},
		bannerphoto: {
			type: String
		},
		likedposts: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Post'
			}
		],
		notifications:[{title:{type:String},timestamp:{type:Date,default:Date.now}}],
		followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
		following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
		achievements: [{ title: { type: String }, description: { type: String }, date: { type: String }, club: { type: String } }],
		clubs:[{name:{type:String},role:{type:String},startyear:{type:String},endyear:{type:String}}],
		savedposts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
	},
	{ versionKey: false }
)

const User = mongoose.model('User', userSchema)

export default User
