// app/api/shiprocket/create/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/database";
import Order from "@/lib/models/order";
import { getShiprocketToken } from "@/lib/shiprocket/auth"; // ✅ use the cached auth helper

export async function POST(req) {
  try {
    await connectDB();

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    // 1️⃣ Fetch the order from MongoDB
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 2️⃣ Construct payload for Shiprocket API
    const shiprocketOrder = {
      order_id: order._id.toString(),
      order_date: order.placedOn
        ? order.placedOn.toISOString().slice(0, 16).replace("T", " ")
        : new Date().toISOString().slice(0, 16).replace("T", " "),
      pickup_location: "Primary", // ⚠️ Must match your Shiprocket pickup name
      billing_customer_name: order.address?.name || "Customer",
      billing_address: order.address?.address || "",
      billing_city: order.address?.city || "",
      billing_pincode: order.address?.pincode || "",
      billing_state: order.address?.state || "",
      billing_country: order.address?.country || "India",
      billing_email: order.address?.email || "customer@example.com",
      billing_phone: order.address?.phone || "",
      shipping_is_billing: true,
      order_items: order.products.map((item) => ({
        name: item.name || "Product",
        sku: item.variantSku || item.sku || `SKU-${item._id}`,
        units: item.quantity,
        selling_price: item.variantPrice || item.price,
        discount: "",
        tax: "",
        hsn: ""
      })),
      payment_method: order.paymentStatus === "COD" ? "COD" : "Prepaid",
      sub_total: order.amountBreakDown?.subtotal || order.amount,
      shipping_charges: order.amountBreakDown?.shipping || 0,
      total_discount: order.amountBreakDown?.discount || 0,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5
    };

    // 3️⃣ Get token dynamically (with caching)
    const token = await getShiprocketToken();

    // 4️⃣ Call Shiprocket API
    const res = await fetch(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(shiprocketOrder)
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("Shiprocket error:", data);
      return NextResponse.json({ error: data }, { status: 500 });
    }

    // 5️⃣ Save courier info if AWB or tracking data available
    const shipment = data?.shipment_id || null;
    const awb = data?.awb_code || null;
    const trackingUrl = data?.tracking_url || null;

    if (shipment || awb) {
      order.courier = {
        ...order.courier,
        courierId: awb,
        shipmentId: shipment,
        trackingUrl,
        pickupScheduled: false
      };
      order.status = "ready to ship";
      order.orderHistory.push({
        status: "ready to ship",
        note: "Order synced to Shiprocket",
        updatedBy: "system"
      });
      await order.save();
    }

    return NextResponse.json({
      success: true,
      message: "Order placed on Shiprocket successfully",
      shiprocketResponse: data
    });
  } catch (err) {
    console.error("Error placing order in Shiprocket:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
