import User from '../models/User.js'
import bcrypt from 'bcrypt'
import GenerateToken from '../utils/GenerateToken.js'
import ValidateBody from '../utils/ValidateBody.js'
import {FindUserById,FindUserByUsername,FindUserByEmail, FindUserByUsernameRegex} from '../utils/FindingFunctions.js'
import HandleResponse from '../utils/HandleResponse.js'
import HandleError from '../utils/HandleError.js'

const Register = async (req, res) => {
 try {
  if (!ValidateBody(['fullname', 'email', 'password','username'], req.body, res)) return

  const { fullname, email, password,username } = req.body

  const existinguser = await FindUserByEmail(email)

  if (existinguser) return HandleResponse(res, false, 'User Already Exits', 409)

  const hashedPassword = await bcrypt.hash(password, 10)

  await User.create({ fullname: fullname, email: email, password: hashedPassword ,username:username})

  HandleResponse(res, true, 'User Registered Successfully', 201)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const GoogleLogin = async (req, res) => {
 try {
  if (!ValidateBody(['fullname', 'email', 'password','username'], req.body, res)) return

  const { fullname, email, password,username } = req.body

  const existinguser = await FindUserByEmail(email)

  if (!existinguser) return HandleResponse(res, false, 'User Not Found', 409)

  const hashedPassword = await bcrypt.hash(password, 10)
  
  existinguser.fullname = fullname;
  existinguser.password = hashedPassword;
  existinguser.username = username;
  await existinguser.save();

  const token = GenerateToken(existinguser._id)

  HandleResponse(res, true, token, 200);
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const Login = async (req, res) => {
 try {
  if (!ValidateBody(['email', 'password'], req.body, res)) return

  const { email, password } = req.body

  const existinguser = await FindUserByEmail(email)

  if (!existinguser) return HandleResponse(res, false, 'User Not Found', 404)

  const ismatched = await bcrypt.compare(password, existinguser.password)

  if (!ismatched) return HandleResponse(res, false, 'Incorrect Password Entered', 400)

  const token = GenerateToken(existinguser._id)

  HandleResponse(res, true, token, 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const EditProfile = async (req, res) => {
 try {
  const id = req.user.data || req.user.id;

  const user = await FindUserById(id, '-password -createdAt')

  if (!user) return HandleResponse(res, false, 'User Not Found', 404)
  ;['fullname', 'accounttype', 'bio', 'avatar', 'bannerphoto'].forEach(field => {
   if (req.body[field] !== undefined) user[field] = req.body[field]
  })

  await user.save()

  const { _id, ...userData } = user.toObject({ versionKey: false })

  HandleResponse(res, true, userData, 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const GetEmailNameAvatar = async (req, res) => {
 try {
  const id = req.user.data || req.user.id;

  const user = await FindUserById(id, '-password -createdAt')

  if (!user) return HandleResponse(res, false, 'User Not Found', 404)

  const data = { fullname: user.fullname, email: user.email, avatar: user.avatar }

  HandleResponse(res, true, data, 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const GetProfileDetails = async (req, res) => {
 try {
  const id = req.user.data || req.user.id;

  const user = await FindUserById(id, '-password -createdAt', ['posts'])

  if (!user) return HandleResponse(res, false, 'User Not Found', 404)

  const data = {
   id: user._id,
   fullname: user.fullname,
   avatar: user.avatar,
   followers: user.followers.length,
   following: user.following.length,
   postlength: user.posts.length,
   post: user.posts,
   bio: user.bio,
   bannerphoto: user.bannerphoto,
   accounttype: user.accounttype,
   achievements: user.achievements,
   clubs:user.clubs
  }

  HandleResponse(res, true, data, 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const GetProfileName = async (req, res) => {
 try {
  const id = req.params.id;

  const user = await FindUserById(id,'');

  if (!user) return HandleResponse(res, false, 'User Not Found', 404)

  const data = {
   id: user._id,
   fullname:user.fullname
  }
  HandleResponse(res, true, data, 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}
const GetProfileDetailsByUsername = async (req, res) => {
 try {

  const id = req.user.data || req.user.id;;

  const mainuser = await FindUserById(id);

  if (!ValidateBody(['username'], req.params, res)) return

  const {username} = req.params;

  const user = await FindUserByUsername(username); 
  
  const isfollowing = user.followers.includes(mainuser._id);

  if (!user) return HandleResponse(res, false, 'User Not Found', 404)

  const data = {
   _id: user._id,
   username:user.username,
   fullname: user.fullname,
   avatar: user.avatar,
   followers: user.followers.length,
   following: user.following.length,
   posts: user.posts.length,
   bio: user.bio,
   isFollowing:isfollowing
  }
  HandleResponse(res, true, data, 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}


const FollowUser = async (req, res) => {
  try {

    const userId = req.user.data || req.user.id;

    const targetId = req.params.id;

    if (userId === targetId) {
      return HandleResponse(res, false, 'You cannot follow yourself', 400);
    }

    const [user, targetUser] = await Promise.all([
      User.findById(userId),
      User.findById(targetId),
    ]);

    if (!user || !targetUser) {
      return HandleResponse(res, false, 'User Not Found', 404);
    }

    const isFollowing = user.following.includes(targetId);

    const updateUser = isFollowing ? { $pull: { following: targetId } } : { $push: { following: targetId } };

    const updateTargetUser = isFollowing ? { $pull: { followers: userId } } : { $push: { followers: userId,notifications: {title: `${user.username} started following you`,timestamp: new Date(),
            },
          },
        };

    await Promise.all([
      User.findByIdAndUpdate(userId, updateUser, { new: true }),
      User.findByIdAndUpdate(targetId, updateTargetUser, { new: true }),
    ]);

    HandleResponse(res,true,isFollowing ? 'Unfollowed Successfully' : 'Followed Successfully',200);
  } catch (error) {
    HandleError(res, false, error.message, 500);
  }
};


const AddClub = async (req, res) => {
 try {
  const userId = req.user.data || req.user.id;

  const user = await FindUserById(userId, '-password -createdAt')

  if (!user) return HandleResponse(res, false, 'User Not Found', 404)

  if (!ValidateBody(['name', 'role', 'startyear'], req.body, res)) return

  const { name, role, startyear } = req.body

  const data = { name, role, startyear }

  user.clubs.push(data)

  await user.save()

  HandleResponse(res, true, 'Club Added Successfully', 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const DeleteClub = async (req, res) => {
 try {
  const userId = req.user.data || req.user.id;

  const user = await FindUserById(userId, '-password -createdAt')

  if (!user) return HandleResponse(res, false, 'User Not Found', 404)

  if (!ValidateBody(['id'], req.body, res)) return

  const { id } = req.body

  for (let i = 0; i < user.clubs.length; i++) {
   const club = user.clubs[i]
   if (club._id == id) {
    user.clubs.splice(i, 1)
    await user.save()
    return HandleResponse(res, true, 'Club Deleted Succesfully', 200)
   }
  }
  HandleResponse(res, false, 'Achievement Not Found', 404)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const EditClub = async (req, res) => {
 try {
  const userId = req.user.data || req.user.id;

  const user = await FindUserById(userId, '-password -createdAt')

  if (!user) return HandleResponse(res, false, 'User Not Found', 404)

  if (!ValidateBody(['id','name', 'role', 'startyear'], req.body, res)) return

  const { id, name, role, startyear,endyear } = req.body

  for (let i = 0; i < user.clubs.length; i++) {
   const old_club = user.clubs[i]
   if (old_club._id == id) {
    const club = user.clubs[i]
    club.name = name
    club.role = role
    club.startyear = startyear 
    club.endyear = endyear
    await user.save()
    return HandleResponse(res, true, 'Club Updated Succesfully', 200)
   }
  }
  HandleResponse(res, false, 'Achievement Not Found', 404)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const AddAchievement = async (req, res) => {
 try {
  const userId = req.user.data || req.user.id;

  const user = await FindUserById(userId, '-password -createdAt')

  if (!user) return HandleResponse(res, false, 'User Not Found', 404)

  if (!ValidateBody(['title', 'description', 'date'], req.body, res)) return

  const { title, description, date } = req.body

  const data = { title, description, date }

  user.achievements.push(data)

  await user.save()

  HandleResponse(res, true, 'Achievement Added Successfully', 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const DeleteAchievement = async (req, res) => {
 try {
  const userId = req.user.data || req.user.id;

  const user = await FindUserById(userId, '-password -createdAt')

  if (!user) return HandleResponse(res, false, 'User Not Found', 404)

  if (!ValidateBody(['id'], req.body, res)) return

  const { id } = req.body

  for (let i = 0; i < user.clubs.length; i++) {
   const achievement = user.achievements[i]
   if (achievement._id == id) {
    user.achievements.splice(i, 1)
    await user.save()
    return HandleResponse(res, true, 'Achievement Deleted Succesfully', 200)
   }
  }
  HandleResponse(res, false, 'Achievement Not Found', 404)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const EditAchievement = async (req, res) => {
 try {
  const userId = req.user.data || req.user.id;

  const user = await FindUserById(userId, '-password -createdAt')

  if (!user) return HandleResponse(res, false, 'User Not Found', 404)

  if (!ValidateBody(['id', 'title', 'description', 'date'], req.body, res)) return

  const { id, title, description, date } = req.body

  for (let i = 0; i < user.clubs.length; i++) {
   const old_achievement = user.achievements[i]
   if (old_achievement._id == id) {
    const achievment = user.achievements[i]
    achievment.title = title
    achievment.description = description
    achievment.date = date
    await user.save()
    return HandleResponse(res, true, 'Achievement Updated Succesfully', 200)
   }
  }
  HandleResponse(res, false, 'Achievement Not Found', 404)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const GetAllUsers = async (req, res) => {
 try {
  const userId = req.user.data || req.user.id;

  const user = await FindUserById(userId, '-password -createdAt')

  if (!user) return HandleResponse(res, false, 'User Not Found', 404)

  const users = await User.find({ _id: { $ne: userId } }).select('avatar fullname')

  HandleResponse(res, true, users, 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const GetUserByUsername = async (req, res) => {
  try {
    if (!ValidateBody(['username'], req.params, res)) return;

    const { username } = req.params;

    const users = await FindUserByUsernameRegex(username); 

    if (!users || users.length === 0) {
      return HandleResponse(res, false, "No users found", 404);
    }

    const data = users.map(user => ({
      _id: user._id,
      fullname: user.fullname,
      avatar: user.avatar,
      username: user.username
    }));

    HandleResponse(res, true, data, 200);
    
  } catch (error) {
    HandleError(res, false, error.message, 500);
  }
};

export { Register,GoogleLogin,Login, GetEmailNameAvatar, GetProfileDetails, EditProfile, FollowUser, AddClub ,DeleteClub,EditClub,AddAchievement, DeleteAchievement, EditAchievement, GetAllUsers,GetUserByUsername,GetProfileDetailsByUsername,GetProfileName}
