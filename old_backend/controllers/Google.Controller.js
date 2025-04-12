import User from '../models/User.js'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import ApiResponse from '../utils/ApiResponse.js'
import ApiError from '../utils/ApiError.js'
const HandleGoogleAuthCallback = async (req, res) => {
	try {
		const email = req.user.emails?.[0]?.value || null
		const existingUser = await User.findOne({ email });
		const googleId = req.user.id
		if (!email) {
			return res.status(400).json(new ApiResponse(false, 'Email not found in Google profile'))
		}
		if (existingUser) {
		      const token = jwt.sign({id:existingUser._id,email:existingUser.email},process.env.JWT_SECRET,{expiresIn:'24h'});
                      return res.redirect(`myapp://google-auth?token=${token}`);
		}
		 await User.create({email:email,id:googleId});
                 const userData = encodeURIComponent(JSON.stringify({email}));
                 res.redirect(`myapp://google-auth?userData=${userData}`);


	} catch (error) {
		res.status(500).json(new ApiError(false, error.message))
	}
}

const HandleGoogleAuth = passport.authenticate('google', {
	scope: ['profile', 'email']
})

export { HandleGoogleAuth, HandleGoogleAuthCallback }
