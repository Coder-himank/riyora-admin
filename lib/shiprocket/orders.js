// /lib/shiprocket/orders.js

import { getShiprocketToken } from "@/lib/shiprocket/auth";

/* Helper to safely choose address fields across different order shapes */
function pickShipping(order) {
  return order.address;
}

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}
/**
 * Generic Shiprocket request wrapper
 */
async function shiprocketRequest(url, body = null, method = "POST") {
  const token = await getShiprocketToken();
  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  if (body && (method === "POST" || method === "PUT")) {
    opts.body = JSON.stringify(body);
  }

  const r = await fetch(url, opts);
  let parsed;

  try {
    parsed = await r.json();
  } catch (e) {
    parsed = { raw: await r.text() };
  }

  console.log("Shiprocket response", JSON.stringify({
    ok: r.ok,
    status: r.status,
    data: parsed,
  }, null, 2));

  return { ok: r.ok, status: r.status, data: parsed };
}

/**
 * Create Shiprocket adhoc order (Flat Format)
 */
export async function createOrder(order, extra = {}) {
  const shipping = pickShipping(order);

  if (!shipping?.pincode || !shipping?.address) {
    return { ok: false, error: "Invalid shipping address" };
  }

  // Sender (billing) details
  const billing = {
    name: process.env.SHIPROCKET_SENDER_NAME || "Sender Name",
    address: process.env.SHIPROCKET_SENDER_ADDRESS || "Sender Address",
    city: process.env.SHIPROCKET_SENDER_CITY || "City",
    state: process.env.SHIPROCKET_SENDER_STATE || "State",
    country: "India",
    pincode: process.env.SHIPROCKET_SENDER_PINCODE || "000000",
    phone: process.env.SHIPROCKET_SENDER_PHONE || "9999999999",
    email: process.env.SHIPROCKET_SENDER_EMAIL || "",
  };

  // Items
  const items = (order.products || []).map((p) => ({
    name: p.name || "Item",
    sku: p.variantSku || p.sku || "SKU",
    units: p.quantity || 1,
    selling_price:
      typeof p.variantPrice !== "undefined"
        ? p.variantPrice
        : p.price || 0,
    discount: p.discount || 0,
    tax: p.tax || 0,
  }));

  // Flat format payload (correct Shiprocket format)

  console.log(isValidEmail(shipping.email));
  const payload = {
    order_id: order._id.toString(),
    order_date: new Date(order.createdAt || Date.now())
      .toISOString()
      .slice(0, 16)
      .replace("T", " "), // "YYYY-MM-DD HH:mm"

    pickup_location:
      extra?.pickup_location ||
      process.env.SHIPROCKET_PICKUP_LOCATION ||
      "Primary",

    channel_id: extra?.channel_id || undefined,

    billing_customer_name: billing.name,
    billing_last_name: "",
    billing_address: billing.address,
    billing_city: billing.city,
    billing_pincode: billing.pincode,
    billing_state: billing.state,
    billing_country: billing.country,
    billing_email: billing.email,
    billing_phone: billing.phone,

    shipping_is_billing: false,

    shipping_customer_name: shipping.name || "Customer",
    shipping_last_name: "",
    shipping_address: shipping.address,
    shipping_city: shipping.city || "",
    shipping_pincode: shipping.pincode,
    shipping_state: shipping.state || "",
    shipping_country: shipping.country || "India",
    shipping_email: isValidEmail(shipping.email) ? shipping.email : "",
    shipping_phone: shipping.phone || shipping.mobile || "9999999999",

    order_items: items,

    payment_method:
      order.paymentStatus === "COD" ? "COD" : "Prepaid",

    sub_total: order.amountBreakdown?.subtotal ?? order.amount,
    shipping_charges: order.amountBreakdown?.shipping ?? 0,
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: order.amountBreakdown?.discount ?? 0,

    length: extra?.length || 10,
    breadth: extra?.breadth || 10,
    height: extra?.height || 10,
    weight: extra?.weight || 0.5,
  };

  console.log("Shiprocket payload:", payload);

  return shiprocketRequest(
    "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
    payload,
    "POST"
  );
}

/**
 * Generate label for shipment IDs
 */
export async function generateLabel(shipmentIdArr = []) {
  if (!Array.isArray(shipmentIdArr) || shipmentIdArr.length === 0) {
    return { ok: false, error: "shipmentId array required" };
  }

  return shiprocketRequest(
    "https://apiv2.shiprocket.in/v1/external/courier/generate/label",
    { shipment_id: shipmentIdArr },
    "POST"
  );
}

/**
 * Schedule pickup
 */
export async function schedulePickup(shipmentIdArr = []) {
  if (!Array.isArray(shipmentIdArr) || shipmentIdArr.length === 0) {
    return { ok: false, error: "shipmentId array required" };
  }

  return shiprocketRequest(
    "https://apiv2.shiprocket.in/v1/external/courier/generate/pickup",
    { shipment_id: shipmentIdArr },
    "POST"
  );
}

/**
 * Cancel order
 */
export async function cancelOrder(orderIds = []) {
  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return { ok: false, error: "order id array required" };
  }

  return shiprocketRequest(
    "https://apiv2.shiprocket.in/v1/external/orders/cancel",
    { ids: orderIds },
    "POST"
  );
}

/**
 * Track via AWB
 */
export async function trackByAwb(awb) {
  if (!awb) return { ok: false, error: "awb required" };

  return shiprocketRequest(
    `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awb}`,
    null,
    "GET"
  );
}
