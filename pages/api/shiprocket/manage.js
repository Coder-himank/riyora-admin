import connectDB from "@/lib/database";
import Order from "@/lib/models/order";
import { getShiprocketToken } from "@/lib/shiprocket/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  await connectDB();

  const fail = (msg = "Something went wrong") =>
    res.status(500).json({ success: false, error: msg });

  try {
    const { action, orderId, extra = {} } = req.body || {};

    if (!action || !orderId) {
      console.warn("⚠️ [Shiprocket] Bad Req ->", req.body);
      return res
        .status(400)
        .json({ success: false, error: "action & orderId required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      console.warn(`⚠️ [Shiprocket] Order not found ${orderId}`);
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    const token = await getShiprocketToken();

    const api = async (url, body) => {
      try {
        const r = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        const data = await r.json();
        return { ok: r.ok, data };
      } catch (e) {
        console.error("❌ [Shiprocket] Network Error:", url, e);
        throw new Error("Shiprocket request failed");
      }
    };

    const done = async (status, note, data = {}) => {
      order.orderHistory.push({
        status,
        note,
        updatedBy: "system",
        date: new Date(),
      });
      await order.save();
      console.log(`✅ [Shiprocket] ${status} for order ${orderId}`);
      return res.json({ success: true, status, ...data });
    };

    const shipmentId = order?.courier?.shipmentId;

    // --------------------------------------------------------------------------
    // ✅ CREATE ORDER
    // --------------------------------------------------------------------------
    if (action === "create") {
      if (shipmentId)
        return res.json({ success: true, message: "Already created" });

      // Hard-coded Billing (your sender details)
      const billing = {
        name: "Himank Jain",
        address: "56, d block, sector 14",
        city: "Udaipur",
        state: "Rajasthan",
        pincode: "313002",
        phone: "7296856604",
        email: "official.himankjain@gmail.com",
      };

      const shipping = order.shippingAddress || order.address;

      if (!shipping?.pincode || !shipping?.address) {
        console.warn("⚠️ Invalid address on order", orderId);
        return res
          .status(400)
          .json({ success: false, error: "Invalid shipping address" });
      }

      const payload = {
        order_id: order._id.toString(),
        order_date: new Date(order.createdAt)
          .toISOString()
          .slice(0, 16)
          .replace("T", " "),
        pickup_location: extra?.pickup_location || "Primary",
        channel_id: "",

        shipping_is_billing: false,

        billing_customer_name: billing.name,
        billing_address: billing.address,
        billing_city: billing.city,
        billing_state: billing.state,
        billing_country: "India",
        billing_pincode: billing.pincode,
        billing_phone: billing.phone,
        billing_email: billing.email,

        shipping_customer_name: shipping.name,
        shipping_address: shipping.address,
        shipping_city: shipping.city,
        shipping_state: shipping.state,
        shipping_country: "India",
        shipping_pincode: shipping.pincode,
        shipping_phone: shipping.phone,
        shipping_email: shipping.email,

        order_items: order.products.map((p) => ({
          name: p.name,
          sku: p.variantSku || p.sku,
          units: p.quantity,
          selling_price: p.variantPrice ?? p.price,
          discount: p.discount || 0,
          tax: p.tax || 0,
        })),

        sub_total: order.amountBreakdown?.subtotal ?? order.amount,
        length: extra?.length || 10,
        breadth: extra?.breadth || 10,
        height: extra?.height || 10,
        weight: extra?.weight || 0.5,

        payment_method: order.paymentStatus === "COD" ? "COD" : "Prepaid",
        shipping_charges: order.amountBreakdown?.shipping ?? 0,
        giftwrap_charges: 0,
        transaction_charges: 0,
        total_discount: order.amountBreakdown?.discount ?? 0,
      };

      const { ok, data } = await api(
        "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
        payload
      );

      if (!ok) {
        console.error("❌ [Shiprocket] Create Failed", data);
        return fail("Failed to create shipment");
      }

      order.courier = {
        courierId: data?.awb_code,
        shipmentId: data?.shipment_id,
        trackingUrl: data?.tracking_url,
      };
      order.status = "ready_to_ship";

      return done("ready_to_ship", "Shiprocket order created", data);
    }

    // --------------------------------------------------------------------------
    // ✅ LABEL
    // --------------------------------------------------------------------------
    if (action === "label") {
      if (!shipmentId)
        return res.status(400).json({ success: false, error: "No shipment" });

      const { ok, data } = await api(
        "https://apiv2.shiprocket.in/v1/external/courier/generate/label",
        { shipment_id: [shipmentId] }
      );

      if (!ok) {
        console.error("❌ [Shiprocket] Label Error", data);
        return fail();
      }

      order.courier.labelUrl = data.label_url;
      return done("label_generated", "Label generated", { label: data.label_url });
    }

    // --------------------------------------------------------------------------
    // ✅ PICKUP
    // --------------------------------------------------------------------------
    if (action === "pickup") {
      if (!shipmentId)
        return res.status(400).json({ success: false, error: "No shipment" });

      const { ok, data } = await api(
        "https://apiv2.shiprocket.in/v1/external/courier/generate/pickup",
        { shipment_id: [shipmentId] }
      );

      if (!ok) {
        console.error("❌ [Shiprocket] Pickup Error", data);
        return fail();
      }

      order.courier.pickupScheduled = true;
      order.courier.pickupDate = data.pickup_scheduled_date;

      return done("pickup_scheduled", "Pickup scheduled", data);
    }

    // --------------------------------------------------------------------------
    // ✅ CANCEL
    // --------------------------------------------------------------------------
    if (action === "cancel") {
      const { ok, data } = await api(
        "https://apiv2.shiprocket.in/v1/external/orders/cancel",
        { ids: [orderId] }
      );

      if (!ok) {
        console.error("❌ [Shiprocket] Cancel Error", data);
        return fail();
      }

      order.status = "cancelled";
      return done("cancelled", "Shipment cancelled");
    }

    // --------------------------------------------------------------------------
    // ✅ TRACK
    // --------------------------------------------------------------------------
    if (action === "track") {
      if (!shipmentId)
        return res.status(400).json({ success: false, error: "No shipment" });

      const { ok, data } = await api(
        `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${order.courier.courierId}`,
        {}
      );

      if (!ok) return fail("Tracking failed");

      return res.json({ success: true, tracking: data });
    }

    return res.status(400).json({ success: false, error: "Invalid action" });
  } catch (err) {
    console.error("🔥 [Shiprocket] Fatal Error", err);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
}
