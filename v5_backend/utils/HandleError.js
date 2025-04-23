import ApiError from "./ApiError.js";
const HandleError = (res, success=false, message, status = 500) => {
  res.status(status).json(new ApiError(success, message));
};

export default HandleError;
