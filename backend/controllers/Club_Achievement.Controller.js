import ValidateBody from '../utils/ValidateBody.js'
import {FindUserById} from '../utils/FindingFunctions.js'
import HandleResponse from '../utils/HandleResponse.js'
import HandleError from '../utils/HandleError.js'
import logger from "../utils/Logger.js"
const AddAchievement = async (req, res) => {
 try {
  const userId = req.user.data || req.user.id;

  const user = await FindUserById(userId, '-password -createdAt')

  if (!user) return HandleResponse(res, false, 'User Not Found', 404)

  if (!ValidateBody(['title', 'level', 'date','postion','media'], req.body, res)) return

  const { title, level, date,postion,media } = req.body

  const data = { title, level, date,postion,media }

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
	
  for (let i = 0; i < user.achievements.length; i++) {
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

  for (let i = 0; i < user.achievements.length; i++) {
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

export {AddAchievement,DeleteAchievement,EditAchievement,AddClub,DeleteClub,EditClub}


