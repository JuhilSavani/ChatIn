const getProfileImageVersion = (user) => {
  if (!user?.updatedAt) return "";

  const timestamp = new Date(user.updatedAt).getTime();
  return Number.isNaN(timestamp) ? "" : String(timestamp);
};

export const getProfileImageUrl = (user) => {
  if (!user?.id || !user?.hasProfilePic) return "";

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const version = getProfileImageVersion(user);
  const versionPath = version ? `v${version}/` : "";

  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${versionPath}profilePics/user_${user.id}`;
};
