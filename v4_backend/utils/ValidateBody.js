import ApiResponse from "./ApiResponse.js";
const ValidateBody = (fields, body, res) => {
  for (const field of fields) {
    if (body[field]==null) {
      res.status(400).json(new ApiResponse(false, `${field} is required`));
      return false;
    }
  }
  return true;
};

export default ValidateBody;
