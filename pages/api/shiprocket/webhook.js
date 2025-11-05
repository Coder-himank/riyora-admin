import connectDB from "@/lib/database";
import Order from "@/lib/models/order";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    await connectDB();

    console.log("Webhook:", req.body);
    const event = req.body;

    const shipmentId = event?.shipment_id;
    const status = event?.current_status?.toLowerCase();

    if (!shipmentId) return res.status(400).json({ error: "No shipment_id" });

    const order = await Order.findOne({ "courier.shipmentId": shipmentId });
    if (!order) return res.status(404).json({ error: "Order not found" });

    const map = {
      "pending": "pending",
      "confirmed": "confirmed",
      "in transit": "shipped",
      "out for delivery": "out_for_delivery",
      "delivered": "delivered",
      "rto initiated": "returned",
      "rto delivered": "returned",
      "cancelled": "cancelled",
      "undelivered": "hold"
    };

    const newStatus = map[status] || order.status;
    order.status = newStatus;

    order.courier.trackingUrl = event?.tracking_url || order.courier.trackingUrl;

    order.orderHistory.push({
      status: newStatus,
      note: `Shiprocket webhook update: ${status}`,
      updatedBy: "webhook"
    });

    if (newStatus === "delivered") order.courier.deliveredOn = new Date();
    await order.save();

    res.json({ success: true });
  } catch (e) {
    console.error("Webhook error:", e);
    res.status(500).json({ error: "Server error" });
  }
}
