import jwt from "jsonwebtoken"
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const isauthenticated = async(req,res,next)=>{
    try {
        const token = req.headers["authorization"];
        if(!token){
            return res.status(400).json(new ApiResponse(false,"Token Not Found"));
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
	if(!decoded) return res.status(404).json(new ApiResponse(false,"Login First"));
        req.user = decoded;
        next();
    } catch (error) {
       res.status(500).json(new ApiError(false, error.message));
    }
}
export default isauthenticated;
