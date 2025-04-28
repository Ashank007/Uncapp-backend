import ApiResponse from "./ApiResponse.js";
const HandleResponse = (res, success, message, status = 200) => {
  res.status(status).json(new ApiResponse(success, message));
};

export default HandleResponse;
