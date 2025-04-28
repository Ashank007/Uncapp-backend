import User from '../models/User.js'
import bcrypt from 'bcrypt'
import GenerateToken from '../utils/GenerateToken.js'
import ValidateBody from '../utils/ValidateBody.js'
import { FindUserById, FindUserByEmail, FindUserByUsernameRegex } from '../utils/FindingFunctions.js'
import HandleResponse from '../utils/HandleResponse.js'
import HandleError from '../utils/HandleError.js'

const Register = async (req, res) => {
 try {
  if (!ValidateBody(['fullname', 'email', 'password', 'username'], req.body, res)) return

  const { fullname, email, password, username } = req.body

  const existinguser = await FindUserByEmail(email)

  if (existinguser) return HandleResponse(res, false, 'User Already Exits', 409)

  const hashedPassword = await bcrypt.hash(password, 10)

  await User.create({ fullname: fullname, email: email, password: hashedPassword, username: username })

  HandleResponse(res, true, 'User Registered Successfully', 201)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const GoogleLogin = async (req, res) => {
 try {
  if (!ValidateBody(['fullname', 'email', 'password', 'username'], req.body, res)) return

  const { fullname, email, password, username } = req.body

  const existinguser = await FindUserByEmail(email)

  if (!existinguser) return HandleResponse(res, false, 'User Not Found', 409)

  const hashedPassword = await bcrypt.hash(password, 10)

  existinguser.fullname = fullname
  existinguser.password = hashedPassword
  existinguser.username = username
  await existinguser.save()

  const token = GenerateToken(existinguser._id)

  HandleResponse(res, true, token, 200)
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
  const id = req.user.data || req.user.id

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
  const id = req.user.data || req.user.id

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
  const id = req.user.data || req.user.id

  const user = await FindUserById(id, '-password -createdAt', ['posts'])

  if (!user) return HandleResponse(res, false, 'User Not Found', 404)

  const data = {
   id: user._id,
   fullname: user.fullname,
   username: user.username,
   avatar: user.avatar,
   followers: user.followers.length,
   following: user.following.length,
   postlength: user.posts.length,
   post: user.posts,
   bio: user.bio,
   bannerphoto: user.bannerphoto,
   accounttype: user.accounttype,
   achievements: user.achievements,
   clubs: user.clubs,
   seasonbest: user.seasonbestrecords.length,
   personalbest: user.personalbestrecords.length,
   streak: user.currentStreak
  }

  HandleResponse(res, true, data, 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const GetProfileName = async (req, res) => {
 try {
  const id = req.params.id

  const user = await FindUserById(id, '')

  if (!user) return HandleResponse(res, false, 'User Not Found', 404)

  const data = {
   id: user._id,
   fullname: user.fullname,
   username: user.username
  }
  HandleResponse(res, true, data, 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const GetProfileDetailsByUsername = async (req, res) => {
 try {
  const id = req.user.data || req.user.id

  const mainuser = await FindUserById(id)

  if (!ValidateBody(['username'], req.params, res)) return

  const { username } = req.params

  const user = await User.findOne({ username: username }).populate('posts')

  if (!user) return HandleResponse(res, false, 'User Not Found', 404)

  const isFollowing = user.followers.includes(mainuser._id)

  const hasSentFollowRequest = mainuser.sentfollowrequests.some(r => r.userid.toString() === user._id.toString())

  const data = {
   _id: user._id,
   username: user.username,
   fullname: user.fullname,
   avatar: user.avatar,
   followers: user.followers.length,
   following: user.following.length,
   numposts: user.posts.length,
   bio: user.bio,
   isFollowing: isFollowing,
   hasSentFollowRequest: hasSentFollowRequest,
   posts: user.posts,
   achievements: user.achievements
  }

  HandleResponse(res, true, data, 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const GetAllUsers = async (req, res) => {
 try {
  const userId = req.user.data || req.user.id

  const user = await FindUserById(userId, '-password -createdAt')

  if (!user) return HandleResponse(res, false, 'User Not Found', 404)

  const followingIds = user.following

  const mutualUsers = await User.find({
   _id: { $in: followingIds, $ne: userId },
   following: userId
  }).select('avatar fullname')

  HandleResponse(res, true, mutualUsers, 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const GetUserByUsername = async (req, res) => {
 try {
  if (!ValidateBody(['username'], req.params, res)) return

  const { username } = req.params

  const users = await FindUserByUsernameRegex(username)

  if (!users || users.length === 0) {
   return HandleResponse(res, false, 'No users found', 404)
  }

  const data = users.map(user => ({
   _id: user._id,
   fullname: user.fullname,
   avatar: user.avatar,
   username: user.username
  }))

  HandleResponse(res, true, data, 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const GetUserFollowers = async (req, res) => {
 try {
  const userId = req.user.data || req.user.id

  const user = await User.findById(userId).populate('followers')

  if (!user) return HandleResponse(res, false, 'User Not Found', 404)

  const data = user.followers.map(item => ({
   _id: item._id,
   avatar: item.avatar,
   fullname: item.fullname,
   username: item.username
  }))

  HandleResponse(res, true, data, 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const GetUserFollowings = async (req, res) => {
 try {
  const userId = req.user.data || req.user.id

  const user = await User.findById(userId).populate('following')

  if (!user) return HandleResponse(res, false, 'User Not Found', 404)

  const data = user.following.map(item => ({
   _id: item._id,
   avatar: item.avatar,
   fullname: item.fullname,
   username: item.username
  }))

  HandleResponse(res, true, data, 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const GetUserAvatar = async (req, res) => {
 try {
  const id = req.user.data || req.user.id
  const user = await User.findById(id)
  if (!user) return HandleResponse(res, false, 'User Not Found', 404)
  const avatar = user.avatar
  HandleResponse(res, true, avatar, 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const AddAthleteDetails = async (req, res) => {
 try {
  const id = req.user.data || req.user.id

  const user = await User.findById(id)
  if (!user) return HandleResponse(res, false, 'User Not Found', 404)

  const { country, athleteCode, personalBests, seasonBests } = req.body

  if (country) user.country = country
  if (athleteCode) user.athletecode = athleteCode

  if (personalBests && Array.isArray(personalBests)) {
   personalBests.forEach(item => {
    const alreadyExists = user.personalbestrecords.some(record => record.sport === item.sport && record.result === item.result && record.date === item.date && record.scorepoints === item.scorepoints)

    if (!alreadyExists) {
     user.personalbestrecords.push({
      sport: item.sport,
      result: item.result,
      date: item.date,
      scorepoints: item.scorepoints
     })
    }
   })
  }

  if (seasonBests && Array.isArray(seasonBests)) {
   seasonBests.forEach(item => {
    const alreadyExists = user.seasonbestrecords.some(record => record.discipline === item.discipline && record.performance === item.performance && record.toplist === item.toplist)

    if (!alreadyExists) {
     user.seasonbestrecords.push({
      discipline: item.discipline,
      performance: item.performance,
      toplist: item.toplist
     })
    }
   })
  }

  await user.save()
  HandleResponse(res, true, 'Athlete Details Added Successfully', 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const GetAthleteDetails = async (req, res) => {
 try {
  const id = req.user.data || req.user.id

  const user = await User.findById(id)

  if (!user) return HandleResponse(res, false, 'User Not Found', 404)

  const data = { country: user.country, athleteCode: user.athletecode, personalBests: user.personalbestrecords, seasonBests: user.seasonbestrecords }

  HandleResponse(res, true, data, 200)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const EditPersonalBest = async (req, res) => {
 try {
  const userId = req.user.data || req.user.id

  const user = await FindUserById(userId, '-password -createdAt')

  if (!user) return HandleResponse(res, false, 'User Not Found', 404)

  if (!ValidateBody(['id', 'sport', 'result', 'date', 'scorepoints'], req.body, res)) return

  const { id, sport, result, date, scorepoints } = req.body

  for (let i = 0; i < user.personalbestrecords.length; i++) {
   const old_personal = user.personalbestrecords[i]
   if (old_personal._id == id) {
    const personal = user.personalbestrecords[i]
    personal.sport = sport
    personal.result = result
    personal.date = date
    personal.scorepoints = scorepoints
    await user.save()
    return HandleResponse(res, true, 'Personal Best Updated Succesfully', 200)
   }
  }
  HandleResponse(res, false, 'Personal Best Not Found', 404)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const DeletePersonalBest = async (req, res) => {
 try {
  const userId = req.user.data || req.user.id

  const user = await FindUserById(userId, '-password -createdAt')

  if (!user) return HandleResponse(res, false, 'User Not Found', 404)

  if (!ValidateBody(['id'], req.body, res)) return

  const { id } = req.body

  for (let i = 0; i < user.personalbestrecords.length; i++) {
   const personalbest = user.personalbestrecords[i]
   if (personalbest._id == id) {
    user.personalbestrecords.splice(i, 1)
    await user.save()
    return HandleResponse(res, true, 'Personal Best Record Deleted Succesfully', 200)
   }
  }
  HandleResponse(res, false, 'Personal Best Record Not Found', 404)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const EditSeasonBest = async (req, res) => {
 try {
  const userId = req.user.data || req.user.id

  const user = await FindUserById(userId, '-password -createdAt')

  if (!user) return HandleResponse(res, false, 'User Not Found', 404)

  if (!ValidateBody(['id', 'discipline', 'performance', 'toplist'], req.body, res)) return

  const { id, discipline, performance, toplist } = req.body

  for (let i = 0; i < user.seasonbestrecords.length; i++) {
   const old_season = user.seasonbestrecords[i]
   if (old_season._id == id) {
    const season = user.seasonbestrecords[i]
    season.discipline = discipline
    season.performance = performance
    season.toplist = toplist
    await user.save()
    return HandleResponse(res, true, 'Season Best Updated Succesfully', 200)
   }
  }
  HandleResponse(res, false, 'Season Best Not Found', 404)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

const DeleteSeasonBest = async (req, res) => {
 try {
  const userId = req.user.data || req.user.id

  const user = await FindUserById(userId, '-password -createdAt')

  if (!user) return HandleResponse(res, false, 'User Not Found', 404)

  if (!ValidateBody(['id'], req.body, res)) return

  const { id } = req.body

  for (let i = 0; i < user.seasonbestrecords.length; i++) {
   const seasonbest = user.seasonbestrecords[i]
   if (seasonbest._id == id) {
    user.seasonbestrecords.splice(i, 1)
    await user.save()
    return HandleResponse(res, true, 'Season Best Record Deleted Succesfully', 200)
   }
  }
  HandleResponse(res, false, 'Season Best Record Not Found', 404)
 } catch (error) {
  HandleError(res, false, error.message, 500)
 }
}

export {
 Register,
 GoogleLogin,
 Login,
 GetEmailNameAvatar,
 GetProfileDetails,
 EditProfile,
 GetAllUsers,
 GetUserByUsername,
 GetProfileDetailsByUsername,
 GetProfileName,
 GetUserFollowers,
 GetUserFollowings,
 GetUserAvatar,
 AddAthleteDetails,
 GetAthleteDetails,
 DeletePersonalBest,
 DeleteSeasonBest,
 EditPersonalBest,
 EditSeasonBest
}
