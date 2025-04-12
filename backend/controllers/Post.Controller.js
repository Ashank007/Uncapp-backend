import Post from '../models/Post.js'
import User from '../models/User.js'
import ValidateBody from '../utils/ValidateBody.js'
import { FindUserById } from '../utils/FindingFunctions.js'
import HandleResponse from '../utils/HandleResponse.js'
import HandleError from '../utils/HandleError.js'

const CreatePost = async (req, res) => {
 try {
  const id = req.user.data || req.user.id

  const user = await FindUserById(id, '-password -createdAt')

  if (!user) return HandleResponse(res, false, 'User Does Not Exist', 404)

  if (!ValidateBody(['description', 'media'], req.body, res)) return

  const { description, media } = req.body

  const newpost = await Post.create({
   createdby: id,
   description: description,
   media: media
  })
  user.posts.push(newpost._id)

  await user.save()

  HandleResponse(res, true, 'Post Created Successfully', 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const EditPost = async (req, res) => {
 try {
  const id = req.user.data || req.user.id

  const user = await FindUserById(id, '-password -createdAt')

  if (!user) return HandleResponse(res, false, 'User Doesn Not Exist', 404)

  if (!ValidateBody(['postid', 'title', 'description', 'media'], req.body, res)) return

  const { postid } = req.body

  const post = await Post.findById(postid)

  if (!post) return HandleResponse(res, false, 'Post Not Found', 404)
  ;['title', 'description', 'media'].forEach(field => {
   if (req.body[field] !== undefined) post[field] = req.body[field]
  })

  await post.save()

  HandleResponse(res, true, 'Post Edited Successfully', 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const DeletePost = async (req, res) => {
 try {
  const id = req.user.data || req.user.id

  const user = await FindUserById(id, '-password -createdAt')

  if (!user) return HandleResponse(res, false, 'User Does Not Exist', 404)

  if (!ValidateBody(['postid'], req.body, res)) return

  const { postid } = req.body

  const post = await Post.findByIdAndDelete(postid)

  if (!post) return HandleResponse(res, false, 'Post Not Found', 404)

  HandleResponse(res, true, 'Post Deleted Successfully')
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const GetAllUserPost = async (req, res) => {
 try {
  const id = req.user.data || req.user.id

  const user = await FindUserById(id, '-password -createdAt', ['posts'])

  if (!user) return HandleResponse(res, false, 'User Does Not Exist', 404)

  const data = { userAvatar: user.avatar, userName: user.fullname, post: user.posts }

  if (!data) return HandleResponse(res, false, 'No Post Found', 404)

  HandleResponse(res, true, data, 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const GetAllUserFollowingPost = async (req, res) => {
 try {
  const id = req.user.data || req.user.id

  const user = await FindUserById(id, '-password -createdAt', ['following'])

  if (!user) return HandleResponse(res, false, 'User Does Not Exist', 404)

  const followingIds = user.following.map(f => f._id || f) // In case it's populated or raw IDs

  const followedUsers = await Promise.all(
   followingIds.map(async followedId => {
    const followedUser = await FindUserById(followedId, 'avatar fullname posts', ['posts'])

    if (!followedUser || !followedUser.posts?.length) return null

    return {
     userId: followedUser._id,
     userAvatar: followedUser.avatar,
     userName: followedUser.fullname,
     posts: followedUser.posts
    }
   })
  )

  const postData = followedUsers.filter(Boolean)

  if (!postData.length) {
   return HandleResponse(res, false, 'No Posts Found', 404)
  }

  HandleResponse(res, true, postData, 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const GetPost = async (req, res) => {
 try {
  const id = req.params.id

  const post = await Post.findById(id)

  if (!post) return HandleResponse(res, false, 'No Post Found', 404)

  HandleResponse(res, true, post, 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const LikePost = async (req, res) => {
 try {
  const userId = req.user.data || req.user.id

  const postid = req.params.id

  const [user, targetpost] = await Promise.all([User.findById(userId), Post.findById(postid)])

  if (!user || !targetpost) return HandleResponse(res, false, 'User or Post Not Found', 404)

  const isLiked = user.likedposts.includes(postid)

  const updateUser = isLiked ? { $pull: { likedposts: postid } } : { $push: { likedposts: postid } }

  const updatePost = isLiked ? { $pull: { likes: userId } } : { $push: { likes: userId } }

  await Promise.all([User.findByIdAndUpdate(userId, updateUser, { new: true }), Post.findByIdAndUpdate(postid, updatePost, { new: true })])

  HandleResponse(res, true, isLiked ? 'Post Liked Unsuccessfully' : 'Post Liked successfully', 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const AddComment = async (req, res) => {
 try {
  const userId = req.user.data || req.user.id

  const postid = req.params.id

  const [user, targetpost] = await Promise.all([User.findById(userId), Post.findById(postid)])

  if (!user || !targetpost) return HandleResponse(res, false, 'User or Post Not Found', 404)

  if (!ValidateBody(['content'], req.body, res)) return

  const { content } = req.body

  const data = { user: userId, content: content }

  targetpost.comments.push(data)

  await targetpost.save()

  HandleResponse(res, true, 'Comment Added Successfully', 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const GetComments = async (req, res) => {
 try {
  const postid = req.params.id

  const targetpost = await Post.findById(postid).populate({ path: 'comments', populate: { path: 'user', select: 'username' } })

  if (!targetpost) return HandleResponse(res, false, 'Post Not Found', 404)

  const data = targetpost.comments.map(comment => {
   return {
    content: comment.content,
    _id: comment._id,
    username: comment.user.username,
    timestamp: comment.timestamp
   }
  })

  HandleResponse(res, true, data, 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const SavePost = async (req, res) => {
 try {
  const userId = req.user.data || req.user.id

  const postId = req.params.id

  const [user, post] = await Promise.all([User.findById(userId), Post.findById(postId)])

  if (!user || !post) return HandleResponse(res, false, 'User or Post Not Found', 404)

  console.log(user.savedposts.includes(postId))

  if (user.savedposts.includes(postId)) {
   const index = user.savedposts.indexOf(postId)
   user.savedposts.splice(index, 1)
   await user.save()
   return HandleResponse(res, true, 'Post UnSaved Successfully', 200)
  }

  user.savedposts.push(postId)

  await user.save()

  HandleResponse(res, true, 'Post Saved Successfully', 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const GetAllSavePost = async (req, res) => {
 try {
  const userId = req.user.data || req.user.id

  const user = await User.findById(userId).populate({
   path: 'savedposts',
   populate: { path: 'createdby' }
  })

  if (!user) return HandleResponse(res, false, 'User Not Found', 404)

  const data = user.savedposts

  HandleResponse(res, true, data, 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

export { CreatePost, EditPost, DeletePost, GetAllUserPost, GetPost, LikePost, SavePost, GetAllSavePost, AddComment, GetComments, GetAllUserFollowingPost }
