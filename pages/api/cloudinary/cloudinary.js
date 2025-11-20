import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { publicId } = req.body;

  if (!publicId) {
    return res.status(400).json({ message: "Missing publicId" });
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return res.status(200).json({ message: "Deleted successfully", result });
  } catch (err) {
    console.error("Cloudinary delete error:", err);
    return res.status(500).json({ message: "Failed to delete image", error: err.message });
  }
}
