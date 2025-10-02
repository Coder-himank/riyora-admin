// File: pages/api/complaints.js   (Next.js Pages Router example)
// Or: app/api/complaints/route.js (Next.js App Router)

import connectDB from "@/lib/database"; // your mongoose connection util
import order from "@/lib/models/order";
import Complaint from "@/lib/models/Complaint";

export default async function handler(req, res) {
  await connectDB();

  try {
    if (req.method === "GET") {
      // Fetch all complaints directly from Complaint collection
      const complaints = await Complaint.find({})
        .sort({ createdAt: -1 })
        .lean();

      res.status(200).json(complaints);
    } else {
      res.setHeader("Allow", ["GET"]);
      res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (err) {
    console.error("Error fetching complaints:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
