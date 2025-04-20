import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from "../models/User.js"
const InitializePassport = () => {
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        'https://api.uncappedapp.com/api/v1/auth/google/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    },
  ),
);
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(async (obj, done) => {
    try {
        const user = await User.findById(obj._id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

}
export default InitializePassport;
