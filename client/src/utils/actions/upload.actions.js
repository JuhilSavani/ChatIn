import axios from "../apis/axios";

/**
 * Uploads media to Cloudinary using securely signed uploads.
 * 
 * @param {File} file - The file to upload
 * @returns {Promise<{secure_url, public_id, ...}>} Cloudinary response
 */
export async function uploadMediaToCloudinary(file) {
  // 1. Authenticate and get our unique signed token
  const { data: signData } = await axios.post("/upload/sign");
  const { signature, timestamp, folder, apiKey, cloudName } = signData;

  // 2. Assemble Cloudinary FormData payload
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", folder);
  formData.append("public_id", "avatar");
  formData.append("overwrite", "true");
  formData.append("invalidate", "true");

  // 3. Perform direct cloud push bypassing backend constraints
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const response = await fetch(cloudinaryUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody?.error?.message || `Cloudinary upload failed (${response.status})`);
  }

  return response.json();
}

export async function uploadChatMedia(file) {
  // 1. Get media signature
  const { data: signData } = await axios.post("/upload/sign-media");
  const { signature, timestamp, folder, apiKey, cloudName } = signData;

  // 2. FormData — must match signed params exactly
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", folder);
  formData.append("use_filename", "true");
  formData.append("unique_filename", "true");

  // 3. Force non-images to upload as 'raw' to avoid Cloudinary's Strict PDF block (HTTP 401)
  const resourceType = file.type.startsWith("image/") ? "image" : "raw";
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
  const response = await fetch(url, { method: "POST", body: formData });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Upload failed (${response.status})`);
  }

  return response.json();
  // Returns: { public_id, secure_url, resource_type, original_filename, ... }
}
