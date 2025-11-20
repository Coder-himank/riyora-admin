import cloudinary from "cloudinary";
import formidable from "formidable";
import fs from "fs";
// import { scanFile } from "@/utils/virusScan"; // hypothetical virus scanning utility

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false, // required for Formidable
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { fileFolder } = req.query;
  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Formidable parse error:", err);
      return res.status(500).json({ error: "Form parsing failed" });
    }

    try {
      const fileArray = Array.isArray(files.file) ? files.file : [files.file];
      const urls = [];

      for (const file of fileArray) {
        // ===== Virus Scan =====
        try {
          const isSafe = true //await scanFile(file.filepath); // returns true/false
          if (!isSafe) {
            fs.unlinkSync(file.filepath);
            return res.status(400).json({ error: "File failed virus scan" });
          }
        } catch (scanErr) {
          console.error("Virus scan failed:", scanErr);
          fs.unlinkSync(file.filepath);
          return res.status(500).json({ error: "Virus scan error" });
        }

        // ===== Determine upload options =====
        let uploadOptions = { folder: fileFolder };

        // For images, you can optimize
        const isImage = file.mimetype?.startsWith("image/");
        if (isImage) {
          // optional: resize or optimize
          const sharp = await import("sharp");
          const buffer = await sharp.default(file.filepath)
            .resize({ width: 1920 })
            .toBuffer();

          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.v2.uploader.upload_stream(uploadOptions, (err, result) => {
              if (err) return reject(err);
              resolve(result);
            });
            stream.end(buffer);
          });
          urls.push(result.secure_url);
        } else {
          // For other files (pdf, video, doc)
          const result = await cloudinary.v2.uploader.upload(file.filepath, uploadOptions);
          urls.push(result.secure_url);
        }

        // Cleanup temp file
        fs.unlinkSync(file.filepath);
      }

      res.status(200).json({ urls });
    } catch (uploadErr) {
      console.error("Upload error:", uploadErr);
      res.status(500).json({ error: "Upload failed" });
    }
  });
}
