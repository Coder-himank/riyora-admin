// app/api/shiprocket/label/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { getShiprocketToken } from "@/lib/shiprocket/auth";

export async function POST(req) {
  try {
    await dbConnect();

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    // 1️⃣ Fetch order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Validate if order has a shipment ID (created via /create)
    const shipmentId = order?.courier?.shipmentId;
    if (!shipmentId) {
      return NextResponse.json(
        { error: "No shipment found for this order. Please create the order on Shiprocket first." },
        { status: 400 }
      );
    }

    // 2️⃣ Get cached Shiprocket token
    const token = await getShiprocketToken();

    // 3️⃣ Check if label already exists
    if (order.courier?.labelUrl) {
      return NextResponse.json({
        success: true,
        message: "Label already generated",
        labelUrl: order.courier.labelUrl
      });
    }

    // 4️⃣ Generate shipping label from Shiprocket
    const res = await fetch("https://apiv2.shiprocket.in/v1/external/courier/generate/label", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        shipment_id: [shipmentId] // Must be an array
      })
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Shiprocket label generation error:", data);
      return NextResponse.json({ error: data }, { status: 500 });
    }

    // 5️⃣ Extract label URL
    const labelUrl =
      data?.label_url ||
      data?.response?.data?.label_url ||
      data?.data?.label_url ||
      null;

    if (!labelUrl) {
      return NextResponse.json(
        { error: "Label URL not found in Shiprocket response", details: data },
        { status: 500 }
      );
    }

    // 6️⃣ Save label URL in the order
    order.courier.labelUrl = labelUrl;
    order.orderHistory.push({
      status: "label_generated",
      note: "Shipping label generated on Shiprocket",
      updatedBy: "system"
    });
    await order.save();

    return NextResponse.json({
      success: true,
      message: "Label generated successfully",
      labelUrl
    });
  } catch (err) {
    console.error("Error generating Shiprocket label:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
