import { v2 as cloudinary } from "cloudinary";

export const generateUploadSignature = (req, res) => {
  try {
    const userId = req.user.id; // User must be authenticated to get a signature
    const folder = `ChatIn/${userId}`; // Organize media tailored to this user
    const timestamp = Math.round(Date.now() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      { 
        folder, 
        timestamp, 
        public_id: 'avatar',
        overwrite: true,
        invalidate: true
      },
      process.env.CLOUDINARY_API_SECRET
    );

    res.status(200).json({
      signature,
      timestamp,
      folder,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    });
  } catch (error) {
    console.error("Upload Signature Error:", error);
    res.status(500).json({ message: "Failed to generate upload signature." });
  }
};
