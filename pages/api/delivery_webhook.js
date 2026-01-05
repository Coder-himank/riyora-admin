// /pages/api/shiprocket/webhook.js
import connectDB from "@/lib/database";
import Order from "@/lib/models/order";
import { sendNotificationToUser } from "@/lib/notification"; // your new notification API helper

/**
 * Shiprocket Webhook Handler
 * 1. Verifies secret (if provided)
 * 2. Finds order by order_id, shipment_id, or AWB
 * 3. Maps Shiprocket status to internal status
 * 4. Updates shipping info & order history
 * 5. Sends notification to user
 */

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  // Optional signature check
  const secret = process.env.SHIPROCKET_WEBHOOK_SECRET;
  if (secret) {
    const sig = req.headers["x-api-key"] || req.headers["x-signature"];
    if (!sig || sig !== secret) {
      console.warn("[Shiprocket Webhook] Invalid signature", sig);
      return res.status(401).json({ success: false, error: "Invalid signature" });
    }
  }

  await connectDB();

  try {
    const payload = req.body || {};
    const shipOrderId = payload.order_id || payload.orderId || payload.orderId_str;
    const shipmentId = payload.shipment_id || payload.shipmentId;
    const awb = payload.awb || payload.awb_code || payload.tracking_no || payload.tracking_number;

    // Find the order
    let order = null;

    if (shipOrderId) {
      order = await Order.findOne({
        $or: [
          { "shipping.shiprocketOrderId": shipOrderId },
          { "courier.shiprocketOrderId": shipOrderId },
        ],
      });
    }

    if (!order && shipmentId) {
      order = await Order.findOne({
        $or: [
          { "shipping.shipmentId": shipmentId },
          { "courier.shipmentId": shipmentId },
        ],
      });
    }

    if (!order && awb) {
      order = await Order.findOne({
        $or: [
          { "shipping.awb": awb },
          { "courier.awb": awb },
          { "courier.courierId": awb },
        ],
      });
    }

    if (!order) {
      console.warn("[Shiprocket Webhook] Order not found for payload", { shipOrderId, shipmentId, awb });
      return res.status(200).json({ success: true, message: "Order not found. Ignored." });
    }

    console.log("going");

    // Map incoming Shiprocket status to internal status
    const incomingStatus = payload.status || payload.current_status || payload.courier_status || payload.event || null;

    const mapStatus = (s) => {
      if (!s) return null;
      const st = String(s).toLowerCase();
      if (st.includes("pickup") || st.includes("picked") || st.includes("pickup_scheduled")) return "shipped";
      if (st.includes("in_transit") || st.includes("in transit") || st.includes("transit")) return "in_transit";
      if (st.includes("out_for_delivery") || st.includes("out for delivery") || st.includes("outfordelivery")) return "out_for_delivery";
      if (st.includes("delivered")) return "delivered";
      if (st.includes("rto") || st.includes("returned")) return "returned";
      if (st.includes("cancel")) return "cancelled";
      return null;
    };

    const newStatus = mapStatus(incomingStatus);

    // Update shipping & courier info
    order.shipping = order.shipping || {};
    order.courier = order.courier || order.shipping || order.courier || {};

    if (payload.shipment_id) order.shipping.shipmentId = payload.shipment_id;
    if (awb) order.shipping.awb = awb;
    if (payload.tracking_url) order.shipping.trackingUrl = payload.tracking_url;

    // Add order history
    order.orderHistory = order.orderHistory || [];
    order.orderHistory.push({
      status: incomingStatus || "shiprocket_update",
      note: `Webhook update: ${JSON.stringify(payload)}`,
      updatedBy: "shiprocket_webhook",
      date: new Date(),
    });

    // Update main order status & special dates
    if (newStatus) {
      order.status = newStatus;
      if (newStatus === "delivered") {
        order.deliveredOn = new Date();
        order.shipping.deliveredOn = new Date();
      }
      if (newStatus === "cancelled") order.cancelledOn = new Date();

      // Notify user
      await sendNotificationToUser(order._id, `Your order #${order._id} status updated: ${newStatus.replace(/_/g, " ")}`);
    }

    await order.save();

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("[Shiprocket Webhook] Error:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}
