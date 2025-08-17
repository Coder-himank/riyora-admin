import Order from "@/lib/models/order";
import connectDB from "@/lib/database";

export default async function handler(req, res) {
    if (req.method !== "PUT") {
        return res.status(405).json({ message: "Method not allowed" }); // ✅ 405 for invalid method
    }

    const { orderId, status } = req.body;

    if (!orderId || !status) {
        return res.status(400).json({ message: "Order ID and Status are required" });
    }

    try {
        
            const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
            );


        return res.status(200).json({ message: "Updated successfully", order: updatedOrder });

    } catch (err) {
        console.error("Update Order Error:", err);
        return res.status(500).json({ message: "Server Error", error: err.message });
    }
}
