// app/api/shiprocket/label/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/database";
import Order from "@/lib/models/order";
import { getShiprocketToken } from "@/lib/shiprocket/auth";

export async function POST(req) {
  try {
    await connectDB();
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const shipmentId = order?.courier?.shipmentId;
    if (!shipmentId) {
      return NextResponse.json(
        { error: "Shipment not created on Shiprocket. Please create order first." },
        { status: 400 }
      );
    }

    // 🚫 If already exists, return
    if (order.courier?.labelUrl) {
      return NextResponse.json({
        success: true,
        message: "Label already exists",
        labelUrl: order.courier.labelUrl
      });
    }

    const token = await getShiprocketToken();

    const res = await fetch("https://apiv2.shiprocket.in/v1/external/courier/generate/label", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ shipment_id: [shipmentId] })
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Shiprocket Label Error:", data);
      return NextResponse.json({
        error: data?.message || "Failed to generate label",
        shiprocketResponse: data
      }, { status: 500 });
    }

    const labelUrl = data?.label_url || data?.response?.data?.label_url || null;

    if (!labelUrl) {
      return NextResponse.json(
        { error: "Shiprocket did not return label URL", details: data },
        { status: 500 }
      );
    }

    // ✅ Save label URL
    order.courier.labelUrl = labelUrl;
    order.orderHistory.push({
      status: "label_generated",
      note: "Shiprocket Label Generated",
      updatedBy: "system"
    });
    await order.save();

    return NextResponse.json({
      success: true,
      message: "Shipping label generated",
      labelUrl
    });

  } catch (error) {
    console.error("Label API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
