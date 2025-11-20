// /pages/api/notifications/send.js
import connectDB from "@/lib/database";
import User from "@/lib/models/User"; // assuming you have a User model
import nodemailer from "nodemailer";
import twilio from "twilio";

/**
 * Send notifications to users via Email and SMS
 * Expected body: { userId, message, email?, phone? }
 */

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

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

    
    return res.status(200).json({ success: true, message: "Notifications sent" });

    // --- Email Notification ---
    if (email) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Your Shop" <${process.env.SMTP_FROM}>`,
        to: email,
        subject: "Order Update",
        text: message,
        html: `<p>${message}</p>`,
      });
    }

    // --- SMS Notification ---
    if (phone) {
      const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE,
        to: phone,
      });
    }

    return res.status(200).json({ success: true, message: "Notifications sent" });
  } catch (err) {
    console.error("[Notifications API] Error:", err);
    return res.status(500).json({ success: false, error: "Failed to send notifications" });
  }
}
