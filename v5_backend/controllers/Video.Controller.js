import User from '../models/User.js'
import Video from '../models/Video.js'
import ValidateBody from '../utils/ValidateBody.js'
import HandleResponse from '../utils/HandleResponse.js'
import HandleError from '../utils/HandleError.js'

const UploadVideo = async (req, res) => {
 try {
  const userId = req.user.data || req.user.id

  const user = await User.findById(userId)

  if (!user) return HandleResponse(res, false, 'User Not Found', 404)

  if (!ValidateBody(['url', 'caption'], req.body, res)) return

  const { url, caption } = req.body

  await Video.create({ createdby: userId, media: url, caption: caption })

  HandleResponse(res, true, 'Video Uploaded Sucessfully', 201)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}
const GetAllUserVideos = async (req, res) => {
 try {
  const userId = req.user.data || req.user.id

  const user = await User.findById(userId)

  if (!user) return HandleResponse(res, false, 'User Not Found', 404)

  const videos = await Video.find({ createdby: userId })

  const videosWithIsLiked = videos.map(video => {
    const isLiked = video.likes.includes(userId);
    return {
        ...video.toObject(),
        isLiked,
      };
  });

  HandleResponse(res, true, videosWithIsLiked, 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}
const LikeVideo = async (req, res) => {
 try {
  const userId = req.user.data || req.user.id

  const videoid = req.params.id

  const [user, targetvideo] = await Promise.all([User.findById(userId), Video.findById(videoid)])

  if (!user || !targetvideo) return HandleResponse(res, false, 'User or Video Not Found', 404)

  const isLiked = targetvideo.likes.includes(userId)

  const updateUser = isLiked ? { $pull: { likedvideos: videoid } } : { $push: { likedvideos: videoid } }

  const updateVideo = isLiked ? { $pull: { likes: userId } } : { $push: { likes: userId } }

  await Promise.all([User.findByIdAndUpdate(userId, updateUser, { new: true }), Video.findByIdAndUpdate(videoid, updateVideo, { new: true })])

  HandleResponse(res, true, isLiked ? 'Video Liked Unsuccessfully' : 'Video Liked successfully', 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

export { UploadVideo, GetAllUserVideos, LikeVideo }
