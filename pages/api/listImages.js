import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  try {
    const { resources } = await cloudinary.search
      .expression("folder:Products") // Change folder if needed
      .sort_by("created_at", "desc")
      .max_results(50)
      .execute();

    res.status(200).json({ resources });
  } catch (err) {
    console.error("Cloudinary error:", err);
    res.status(500).json({ error: "Failed to fetch images" });
  }
}
