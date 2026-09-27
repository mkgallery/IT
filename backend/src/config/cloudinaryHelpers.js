const cloudinary = require("./cloudinary");

/**
 * Extract the public_id from a Cloudinary URL and delete the asset.
 * Returns true on success, false if the URL is invalid.
 */
async function deleteCloudinaryFile(url) {
  if (!url) return false;

  try {
    // URL looks like: https://res.cloudinary.com/<cloud>/image/upload/v123/folder/filename.ext
    const parts = url.split("/upload/");
    if (parts.length < 2) return false;

    // Remove version prefix (v1234567/)
    let path = parts[1].replace(/^v\d+\//, "");

    // Strip file extension (Cloudinary public_id has no extension)
    path = path.replace(/\.[^/.]+$/, "");

    // Determine resource type from URL
    const resourceType = url.includes("/video/upload/") ? "video" : "image";

    await cloudinary.uploader.destroy(path, { resource_type: resourceType });
    return true;
  } catch (err) {
    console.error("Cloudinary delete failed:", err.message);
    return false;
  }
}

module.exports = { deleteCloudinaryFile };
