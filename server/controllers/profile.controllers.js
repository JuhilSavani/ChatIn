import { User } from "../models/user.models.js";

export const updateProfile = async (req, res) => {
  try {
    const userId = req.params?.id;
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update name if provided
    if (req.body?.name) user.name = req.body.name;

    // Update profile picture URL instead of handling a file buffer natively
    if ("profilePicUrl" in req.body) {
      user.profilePicUrl = req.body.profilePicUrl;
      user.updatedAt = new Date(); // Hard refresh timestamp cache
    }

    await user.save();

    return res.status(200).json({ message: "Profile updated successfully", user: {
      id: user.id,
      name: user.name,
      email: user.email,
      profilePicUrl: user.profilePicUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }});
  } catch (error) {
    console.error(error.stack);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};
