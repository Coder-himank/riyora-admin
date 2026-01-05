import connectDB from "@/lib/database";
import User from "@/lib/models/User";
import axios from "axios";
import { Resend } from "resend";

/**
 * Expected POST body:
 * {
 *   userId: string,
 *   type: "orderUpdated",
 *   templateData: { orderId, customerName, status },
 *   message?: string,          // SMS message
 *   email?: string,            // override email
 *   phone?: string             // override phone
 * }
 */

const resend = new Resend(process.env.RESEND_API_KEY);

/* =========================
   EMAIL TEMPLATES
   ========================= */
const mailTemplates = {
  orderUpdated: {
    subject: "Order Updated Successfully 🎉",
    html: (orderId, customerName, status) => `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2>Hi ${customerName},</h2>
        <p>Your order has been <strong>updated successfully</strong>!</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>New Status:</strong> ${status}</p>
        <p>Thank you for shopping with us. We appreciate your business!</p>
        <br/>
        <p>Best regards,<br/>Riyora Organic Team</p>
      </div>
    `,
  },
};

/* =========================
   SEND EMAIL
   ========================= */
const sendMail = async (to, type, templateData) => {
  const template = mailTemplates[type];
  if (!template) throw new Error("Invalid email template");

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to,
    subject: template.subject,
    html: template.html(
      templateData.orderId,
      templateData.customerName,
      templateData.status
    ),
  });
};

/* =========================
   SEND SMS (Fast2SMS)
   ========================= */
const sendSMS = async (phone, message) => {
  if (!phone || !message) return;
  return

  await axios.post(
    "https://www.fast2sms.com/dev/bulkV2",
    {
      route: "v3",
      sender_id: "TXTIND",
      message,
      language: "english",
      numbers: phone,
    },
    {
      headers: {
        authorization: process.env.FAST2SMS_API_KEY,
      },
    }
  );
};

/* =========================
   API HANDLER
   ========================= */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method Not Allowed" });
  }

  try {
    const {
      userId,
      type,
      templateData,
      message,
      email: overrideEmail,
      phone: overridePhone,
    } = req.body;

    if (!userId || !type) {
      return res.status(400).json({
        success: false,
        error: "userId and type are required",
      });
    }

    await connectDB();

    const user = await User.findById(userId).lean();
    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: "User not found" });
    }

    const email = overrideEmail || user.email;
    const phone = overridePhone || user.phone;

    /* ---- EMAIL ---- */
    if (email) {
      await sendMail(email, type, templateData);
    }

    /* ---- SMS ---- */
    if (phone && message) {
      await sendSMS(phone, message);
    }

    return res.status(200).json({
      success: true,
      message: "Notifications sent successfully",
    });
  } catch (error) {
    console.error("[Notifications API Error]", error);
    return res.status(500).json({
      success: false,
      error: "Failed to send notifications",
    });
  }
}
