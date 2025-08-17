// pages/api/fetchLabels.js
import connectDB from "@/lib/database";
import Order from "@/lib/models/order";  

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();

    const { orders } = req.body;

    if (!orders || !Array.isArray(orders)) {
      return res.status(400).json({ message: "order IDs required" });
    }

    const orderDocs = await Order.find({ _id: { $in: orders } });

    if (!orderDocs.length) {
      return res.status(404).json({ message: "No orders found" });
    }

    const labelResults = await Promise.all(
      orderDocs.map(async (ord) => {
        if (!ord.courier || !ord.address) return null;

        const { _id, courier, address } = ord;
        const { courier_name } = courier;
        const { name, phone, email, city, state, country, pincode, address: street } = address || {};

        // Mock label (replace with real API later)
        const labelUrl = `https://dummy-courier.com/labels/${courier_name}_${_id}.pdf`;

        await connectDB();
        await Order.findByIdAndUpdate(_id, {status : "ready to ship"})

        return { orderId: _id, courier: courier_name, labelUrl };
      })
    );

    return res.status(200).json({
      message: "Labels fetched successfully",
      labels: labelResults.filter(Boolean), // remove nulls from skipped orders
    });
  } catch (error) {
    console.error("Error fetching labels:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
