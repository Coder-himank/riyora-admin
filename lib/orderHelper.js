// /lib/orderHelper.js
import Order from "@/lib/models/order";
import {
  createOrder,
  generateLabel,
  schedulePickup,
  cancelOrder,
  trackByAwb,
} from "@/lib/shiprocket/orders";
import { sendNotificationToUser } from "@/lib/notification";
import { updateStock, restockProducts } from "@/lib/inventory";
import { refundPayment } from "@/lib/payments";
import assignCourier from "@/lib/shiprocket/assignCourier";
import connectDB from "./database";
// ------------------ Update Order Status ------------------
export const handleOrderStatus = async (orderId, status, options = {}) => {
  await connectDB();
  const { note = "", notifyUser = true, refund = false, updatedBy = "system" } = options;

  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");

  const validTransitions = {
    pending: ["confirmed", "cancelled", "invalid_address"],
    confirmed: ["ready_to_ship", "cancelled"],
    ready_to_ship: ["in_transit", "cancelled"],
    in_transit: ["out_for_delivery", "returned"],
    out_for_delivery: ["delivered", "returned"],
  };

  if (
    order.status !== status &&
    validTransitions[order.status] &&
    !validTransitions[order.status].includes(status)
  ) {
    throw new Error(`Cannot change status from ${order.status} to ${status}`);
  }

  order.status = status;
  order.orderHistory = order.orderHistory || [];
  order.orderHistory.push({ status, note, updatedBy, date: new Date() });

  if (status === "delivered") order.deliveredOn = new Date();
  if (status === "cancelled") {
    order.cancelledOn = new Date();
    await restockProducts(order.products);
    if (refund && order.paymentStatus === "paid") await refundPayment(order._id);
  }

  await order.save();

  if (notifyUser) {
    await sendNotificationToUser(order._id, `Your order #${order._id} status updated: ${status}`);
  }

  return order;
};

// ------------------ Shiprocket Actions ------------------
export const handleShiprocketAction = async (orderId, action, extra = {}) => {

  await connectDB();
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");

  order.shipping = order.shipping || {};
  order.courier = order.courier || {};

  switch (action) {
    case "create":
      console.log("creatign orderd");
      if (order.shipping.shipmentId) return order;
      const respCreate = await createOrder(order, extra);

      if (!respCreate.ok) throw new Error(respCreate.error || "Create shipment failed" + JSON.stringify(respCreate));
      order.shipping.shipmentId = respCreate.data.shipment_id;
      order.shipping.shiprocketOrderId = respCreate.data.order_id;
      order.shipping.awb = respCreate.data.awb_code;
      order.shipping.trackingUrl = respCreate.data.tracking_url;
      order.status = "ready_to_ship";


      order.orderHistory.push({
        status: "ready_to_ship",
        note: "Shipment created",
        updatedBy: "system",
        date: new Date(),
      });
      await order.save();
      return order;

    case "generate_label":
      if (!order.shipping.shipmentId) throw new Error("No shipmentId found");
      const respLabel = await generateLabel([order.shipping.shipmentId]);
      order.shipping.labelUrl = respLabel.data?.label_url;
      await order.save();
      return order;

    case "pickup":
      if (!order.shipping.shipmentId) throw new Error("No shipmentId found");
      const respPickup = await schedulePickup([order.shipping.shipmentId]);
      order.shipping.pickupScheduled = true;
      order.shipping.pickupDate = respPickup.data?.pickup_scheduled_date;
      await order.save();
      return order;

    case "cancel":
      if (!order.shipping.shiprocketOrderId) throw new Error("No shipment created");
      await cancelOrder([order.shipping.shiprocketOrderId]);
      await handleOrderStatus(orderId, "cancelled", { note: "Shipment cancelled", refund: true });
      return await Order.findById(orderId);

    case "track":
      if (!order.shipping.awb) throw new Error("No AWB found");
      return await trackByAwb(order.shipping.awb);

    default:
      throw new Error("Invalid Shiprocket action");
  }
};

// ------------------ Combined Handler ------------------
export const handleOrderAction = async (orderId, type, options = {}) => {
  await connectDB();
  switch (type) {
    case "confirm":
    case "ready_to_ship":
    case "in_transit":
    case "out_for_delivery":
    case "delivered":
    case "cancelled":
    case "invalid_address":
      return await handleOrderStatus(orderId, type, options);

    case "refund":
      return await handleOrderStatus(orderId, "cancelled", {
        ...options,
        refund: true,
        note: "Refund processed",
      });

    case "ship_create":
    case "generate_label":
    case "pickup":
    case "cancel_shipment":
    case "track":
      const actionMap = { ship_create: "create", cancel_shipment: "cancel" };
      const action = actionMap[type] || type;
      return await handleShiprocketAction(orderId, action, options);

    default:
      throw new Error("Unknown action type");
  }
};
