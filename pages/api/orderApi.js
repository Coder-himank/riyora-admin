// pages/api/orders.js
import Order from "@/lib/models/order";
import connectDB from "@/lib/database";
import { sendNotificationToUser } from "@/lib/notification"; // implement SMS/email
import { refundPayment } from "@/lib/payments"; // implement refund logic

// ---------------- Date Range Helper ----------------
function getDateRange(filterType) {
  const now = new Date();
  let startDate, endDate;

  switch (filterType) {
    case "today":
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
      break;

    case "week": {
      const currentDay = now.getDay();
      const diffToMonday = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
      startDate = new Date(now.setDate(diffToMonday));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
    }

    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;

    case "year":
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;

    default:
      startDate = new Date(0);
      endDate = new Date();
  }

  return { startDate, endDate };
}

// ---------------- API Handler ----------------
export default async function handler(req, res) {
  await connectDB();

  // ---------------- GET: Fetch Orders ----------------
  if (req.method === "GET") {
    try {
      const { filter, orderId } = req.query;

      if (orderId) {
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ success: false, error: "Order not found" });
        return res.status(200).json({ success: true, order });
      }

      const { startDate, endDate } = getDateRange(filter);
      const orders = await Order.find({
        placedOn: { $gte: startDate, $lte: endDate },
      }).sort({ placedOn: -1 });

      const stats = {
        totalOrders: orders.length,
        totalSales: orders.reduce((sum, o) => sum + (o.amount || 0), 0),
        pendingOrders: orders.filter(o => o.status === "pending").length,
        shippedOrders: orders.filter(o => o.status === "shipped").length,
        orders,
      };

      return res.status(200).json({ success: true, stats });
    } catch (err) {
      console.error("[Order API GET] Error:", err);
      return res.status(500).json({ success: false, error: "Internal server error" });
    }
  }

  // ---------------- PUT: Update Order ----------------
  if (req.method === "PUT") {
    try {
      const { orderId, updatedFields, action } = req.body;

      if (!orderId) return res.status(400).json({ success: false, error: "Missing orderId" });

      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ success: false, error: "Order not found" });

      // ---------------- Handle Actions ----------------
      if (action === "refund") {
        if (order.paymentStatus !== "Paid") {
          return res.status(400).json({ success: false, error: "Cannot refund unpaid order" });
        }
        await processRefund(order); // your refund logic here
        order.status = "refunded";
        order.orderHistory.push({
          status: "refunded",
          note: "Refund processed",
          updatedBy: "admin",
          date: new Date(),
        });

        // Notify user
        await sendNotificationToUser(order.userId, `Your refund for order #${order._id} has been processed`);

        await order.save();
        return res.status(200).json({ success: true, message: "Refund processed", order });
      }

      if (action === "invalid_address") {
        order.status = "hold";
        order.orderHistory.push({
          status: "hold",
          note: "Invalid address detected",
          updatedBy: "admin",
          date: new Date(),
        });

        // Notify user
        await sendNotificationToUser(order.userId, `Your order #${order._id} has an invalid address. Please update.`);

        await order.save();
        return res.status(200).json({ success: true, message: "Marked as invalid address", order });
      }

      // ---------------- Generic Update ----------------
      if (updatedFields) {
        Object.assign(order, updatedFields);
        order.orderHistory.push({
          status: updatedFields.status || "updated",
          note: `Updated fields: ${Object.keys(updatedFields).join(", ")}`,
          updatedBy: "admin",
          date: new Date(),
        });

        // Notify user if status changed
        if (updatedFields.status) {
          await sendNotificationToUser(order.userId, `Your order #${order._id} status is now ${updatedFields.status}`);
        }

        await order.save();
        return res.status(200).json({ success: true, message: "Order updated", order });
      }

      return res.status(400).json({ success: false, error: "No action or fields provided" });
    } catch (err) {
      console.error("[Order API PUT] Error:", err);
      return res.status(500).json({ success: false, error: "Internal server error" });
    }
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}
