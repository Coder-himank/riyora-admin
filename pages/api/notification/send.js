// /pages/api/notifications/send.js
import connectDB from "@/lib/database";
import User from "@/lib/models/User";
import nodemailer from "nodemailer";
import axios from "axios";

/**
 * Send notifications to users via Email and SMS (Fast2SMS)
 * Expected body: { userId, message, email?, phone? }
 */

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }
  return res.status(200).json({ success: true, error: "Notiication not working" });

  const { userId, message, email: overrideEmail, phone: overridePhone } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ success: false, error: "userId and message are required" });
  }

  await connectDB();

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    const email = overrideEmail || user.email;
    const phone = overridePhone || user.phone;

    // --- Email Notification ---
    if (email) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Your Shop" <${process.env.SMTP_FROM}>`,
        to: email,
        subject: "Notification Update",
        text: message,
        html: `<p>${message}</p>`,
      });
    }

    // --- SMS Notification (Fast2SMS) ---
    if (phone) {
      const options = {
        method: "POST",
        url: "https://www.fast2sms.com/dev/bulkV2",
        headers: {
          "authorization": process.env.FAST2SMS_API_KEY,
        },
        data: {
          route: "v3",
          sender_id: "TXTIND",
          message: message,
          language: "english",
          numbers: phone,
        },
      };

      await axios(options);
    }

    return res.status(200).json({ success: true, message: "Notifications sent" });

  } catch (err) {
    console.error("[Notifications API] Error:", err);
    return res.status(500).json({ success: false, error: "Failed to send notifications" });
  }
}
