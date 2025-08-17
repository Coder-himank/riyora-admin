import cloudinary from "cloudinary";
import formidable from "formidable";
import sharp from "sharp";
import fs from "fs";

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

            const uploadPromises = fileArray.map(async (file) => {
                
                const metadata = await sharp(file.filepath).metadata();

                let pipeline = sharp(file.filepath).resize({ width: 1920 });

                if (metadata.hasAlpha) {
                    pipeline = pipeline.png({ quality: 80, compressionLevel: 8 });
                } else {
                    pipeline = pipeline.jpeg({ quality: 80 });
                }

                const buffer = await pipeline.toBuffer();


                return new Promise((resolve, reject) => {
                    const stream = cloudinary.v2.uploader.upload_stream(
                        { folder: fileFolder },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result);
                        }
                    );
                    stream.end(buffer); // send buffer to Cloudinary
                });
            });

            const results = await Promise.all(uploadPromises);

            // cleanup temp files
            fileArray.forEach((file) => {
                try {
                    fs.unlinkSync(file.filepath);
                } catch (cleanupErr) {
                    console.warn(`Failed to delete temp file ${file.filepath}:`, cleanupErr);
                }
            });

            const urls = results.map((r) => r.secure_url);
            res.status(200).json({ urls });
        } catch (uploadErr) {
            console.error("Cloudinary upload error:", uploadErr);
            res.status(500).json({ error: "Upload failed" });
        }
    });
}
