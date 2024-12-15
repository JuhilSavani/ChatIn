import dotenv from "dotenv";
import passport from "passport";
import { Strategy } from 'passport-jwt';
import { User } from "../models/user.models.js";

dotenv.config();

const jwtOptions = {
  jwtFromRequest: (req) => req?.cookies?.chatinToken || null,
  secretOrKey: process.env.JWT_SECRET,
};

export const configPassport = () => {
  passport.use(
    new Strategy(jwtOptions, async (jwtPayload, callback) => {
      try {
        const user = await User.findByPk(jwtPayload.id, {
          attributes: ["id", "name", "email", "createdAt"],
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

export const authenticateJWT = passport.authenticate('jwt', { session: false });
