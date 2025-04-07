import User from '../models/User.js'
import Story from '../models/Story.js'
import ValidateBody from '../utils/ValidateBody.js'
import {FindUserById} from "../utils/FindingFunctions.js" 
import HandleResponse from '../utils/HandleResponse.js'
import HandleError from '../utils/HandleError.js'

const CreateStory = async (req, res) => {
 try {

  const id = req.user.data || req.user.id;

  const user = await FindUserById(id,"-password -createdAt"); 

  if (!user) return HandleResponse(res,false,"User Not Found",404)

  if(!ValidateBody(["mediaUrl"],req.body,res))return ;

  const {mediaUrl} = req.body;

  const newstory = await Story.create({ createdby: id, mediaUrl: mediaUrl })

  user.stories.push(newstory._id)

  await user.save()

  HandleResponse(res,true,"Story Created Successfully",201)

 } catch (error) {

  HandleError(res, false, error.message, 500);

 }
}
const GetAllUserStory = async (req, res) => {
 try {

  const id = req.user.data || req.user.id;

  const user = await FindUserById(id,"-password -createdAt",["stories","following"]); 
	
  if (!user) return HandleResponse(res,false,"User Not Found",404)


  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const userStories = user.stories.filter(story => new Date(story.createdAt) >= oneDayAgo);

  const followingStoriesPromises = user.following.map(async (followedUserId) => {
    const followedUser = await FindUserById(followedUserId,"", ["avatar stories"]);


    if (!followedUser || !followedUser.stories) return null;

    const recentStories = followedUser.stories.filter(
      (story) => new Date(story.createdAt) >= oneDayAgo
    );

    if (recentStories.length === 0) return null;

    return {
      userId: followedUser._id,
      avatar: followedUser.avatar,
      stories: recentStories
    };
  });

  const followingStoriesRaw = await Promise.all(followingStoriesPromises);
  
  const followingStories = followingStoriesRaw.filter(Boolean); 
  
  HandleResponse(res,true,{user:{userId:user._id,avatar:user.avatar,stories:userStories},following:followingStories},200)

 } catch (error) {

  HandleError(res, false, error.message, 500);

 }
}
const GetStory = async (req, res) => {
 try {

  const id = req.params.id || req.user.id;

  const story = await Story.findById(id)

  const user = await User.findById(story.createdby)

  if (!story) HandleResponse(res,false,"Story Not Found",404)

  const data = { id: story._id, mediaUrl: story.mediaUrl, name: user.fullname, avatar: user.avatar, createdAt: story.createdAt }

  HandleResponse(res,true,data,200)

 } catch (error) {

  HandleError(res, false, error.message, 500);

 }
}


export { CreateStory, GetAllUserStory, GetStory}
