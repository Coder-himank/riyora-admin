import connectDB from "@/lib/database";
import Predefined from "@/lib/models/predefinedValues";

export default async function handler(req, res) {
  await connectDB();

  try {
    if (req.method === "GET") {
      const data = await Predefined.findOne({});
      return res.status(200).json(data || {});
    }

    if (req.method === "POST") {
      const { field, item } = req.body;
      if (!field || !item) return res.status(400).json({ message: "Field and item are required." });

      let doc = await Predefined.findOne({});
      if (!doc) doc = new Predefined({});

      if (!doc[field]) doc[field] = [];
      doc[field].push(item);

      await doc.save();
      return res.status(201).json(doc);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Predefined API Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
