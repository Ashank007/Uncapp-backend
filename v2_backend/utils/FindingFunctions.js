
import User from '../models/User.js'

const FindUserByEmail = async (email) => {
 return await User.findOne({ email })
}

const FindUserById = async (id, excludedFields, populateFields = []) => {
  if (!Array.isArray(populateFields)) {
    populateFields = populateFields ? [populateFields] : [];
  }
 let query = User.findById(id).select(excludedFields)
 
  populateFields.forEach((field) => {
    query = query.populate(field);
  });

 return await query.exec();
}
const FindUserByUsername = async (username) => {
  return await User.findOne({
    username: username 
  });
};


const FindUserByUsernameRegex = async (searchInput) => {
  return await User.find({ fullname: {$regex:searchInput,$options:"i"} });
};
export {FindUserById,FindUserByEmail,FindUserByUsername,FindUserByUsernameRegex};
