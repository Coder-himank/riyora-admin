// /pages/api/shiprocket/manage.js
import connectDB from "@/lib/database";
import Order from "@/lib/models/order";
import {
  createOrder,
  generateLabel,
  schedulePickup,
  cancelOrder,
  trackByAwb,
} from "@/lib/shiprocket/orders";
import { sendNotificationToUser } from "@/lib/notification"; // Your helper

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  await connectDB();

  try {
    const { action, orderId, extra = {} } = req.body || {};

    if (!action || !orderId) {
      return res.status(400).json({ success: false, error: "action & orderId required" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, error: "Order not found" });

    // Ensure shipping & courier objects exist
    order.shipping = order.shipping || {};
    order.courier = order.courier || order.shipping || {};

    // Helper: push history & save
    const pushHistory = async (status, note = "") => {
      order.orderHistory = order.orderHistory || [];
      order.orderHistory.push({ status, note, updatedBy: "system", date: new Date() });
      order.updatedAt = new Date();
      await order.save();
    };

    // ---------------- CREATE ----------------
    if (action === "create") {
      if (order.shipping.shipmentId || order.courier.shipmentId) {
        return res.json({ success: true, message: "Shipment already created", order });
      }

      // Validate courier selection
      if (extra.courierName && typeof extra.courierName !== "string") {
        return res.status(400).json({ success: false, error: "Invalid courierName" });
      }

      const resp = await createOrder(order, extra);
      if (!resp.ok) {
        console.error("[Shiprocket create] failed", resp);
        return res.status(500).json({ success: false, error: resp.data || resp.error || "Create failed" });
      }

      const data = resp.data || {};
      const shipmentId = data.shipment_id || data.order_id;
      const awb = data.awb_code || data.awb || data.tracking_number;
      const trackingUrl = data.tracking_url || data.tracking_url_web;

      // Update shipping & courier
      order.shipping = { ...order.shipping, shiprocketOrderId: data.order_id || order._id.toString(), shipmentId, awb, trackingUrl };
      order.courier = { ...order.courier, shipmentId, awb, courierId: awb, trackingUrl };

      order.status = "ready_to_ship";
      await pushHistory("ready_to_ship", `Shipment created${extra.courierName ? ` with courier ${extra.courierName}` : ""}`);

      // Notify user
      await sendNotificationToUser(order, `Your order #${order._id} is ready to ship.`);

      return res.json({ success: true, status: "ready_to_ship", order, data });
    }

    // ---------------- LABEL ----------------
    if (action === "label") {
      const shipmentId = order.shipping.shipmentId || order.courier.shipmentId;
      if (!shipmentId) return res.status(400).json({ success: false, error: "No shipmentId" });

      const resp = await generateLabel([shipmentId]);
      if (!resp.ok) {
        console.error("[Shiprocket label] failed", resp);
        return res.status(500).json({ success: false, error: resp.data || resp.error || "Label generation failed" });
      }

      const data = resp.data || {};
      const labelUrl = data.label_url || (data[0] && data[0].label_url);

      order.shipping.labelUrl = labelUrl || order.shipping.labelUrl;
      order.courier.labelUrl = labelUrl || order.courier.labelUrl;
      await pushHistory("label_generated", "Shipping label generated");

      return res.json({ success: true, labelUrl, order, data });
    }

    // ---------------- PICKUP ----------------
    if (action === "pickup") {
      const shipmentId = order.shipping.shipmentId || order.courier.shipmentId;
      if (!shipmentId) return res.status(400).json({ success: false, error: "No shipmentId" });

      const resp = await schedulePickup([shipmentId]);
      if (!resp.ok) {
        console.error("[Shiprocket pickup] failed", resp);
        return res.status(500).json({ success: false, error: resp.data || resp.error || "Pickup scheduling failed" });
      }

      const data = resp.data || {};
      order.shipping.pickupScheduled = true;
      order.shipping.pickupDate = data.pickup_scheduled_date || order.shipping.pickupDate;
      order.courier.pickupScheduled = order.shipping.pickupScheduled;
      order.courier.pickupDate = order.shipping.pickupDate;

      await pushHistory("pickup_scheduled", "Pickup scheduled via Shiprocket");

      // Notify user
      await sendNotificationToUser(order, `Pickup scheduled for your order #${order._id}.`);

      return res.json({ success: true, order, data });
    }

    // ---------------- CANCEL ----------------
    if (action === "cancel") {
      const shipOrderId = order.shipping.shiprocketOrderId || order._id.toString();
      const resp = await cancelOrder([shipOrderId]);
      if (!resp.ok) {
        console.error("[Shiprocket cancel] failed", resp);
        return res.status(500).json({ success: false, error: resp.data || resp.error || "Cancel failed" });
      }

      order.status = "cancelled";
      await pushHistory("cancelled", "Shipment cancelled via Shiprocket");

      // Notify user
      await sendNotificationToUser(order, `Your order #${order._id} has been cancelled.`);

      return res.json({ success: true, status: "cancelled", order, data: resp.data });
    }

    // ---------------- TRACK ----------------
    if (action === "track") {
      const awb = order.shipping.awb || order.courier.awb || order.courier.courierId;
      if (!awb) return res.status(400).json({ success: false, error: "No AWB found" });

      const resp = await trackByAwb(awb);
      if (!resp.ok) {
        console.error("[Shiprocket track] failed", resp);
        return res.status(500).json({ success: false, error: resp.data || resp.error || "Tracking failed" });
      }

      await pushHistory("tracking_polled", "Tracking polled from Shiprocket");
      return res.json({ success: true, tracking: resp.data, order });
    }

    return res.status(400).json({ success: false, error: "Invalid action" });

  } catch (err) {
    console.error("[Shiprocket Manage] Error:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}
