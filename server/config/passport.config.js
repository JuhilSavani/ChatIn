import dotenv from "dotenv";
import passport from "passport";
import { Strategy, ExtractJwt } from 'passport-jwt';
import { User } from "../models/user.models.js";

dotenv.config();

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.ACCESS_TOKEN_SECRET,
};

export const configPassport = () => {
  passport.use(
    new Strategy(jwtOptions, async (jwtPayload, callback) => {
      try {
        const user = await User.findByPk(jwtPayload.sub, {
          attributes: ["id", "name", "email"],
        });
        if (user) {
          return callback(null, user);
        } else {
          return callback(null, false);
        }
      } catch (error) {
        console.error("[Passport Config] Error during JWT user lookup:", error);
        return callback(error, false);
      }
    })
  );
};