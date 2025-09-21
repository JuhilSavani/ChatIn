import passport from "passport";
import multer from "multer";

// Authentication 
export const authenticateJWT = passport.authenticate('jwt', { session: false });

// File Upload
export const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

