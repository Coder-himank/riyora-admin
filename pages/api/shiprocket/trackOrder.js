import { NextResponse } from "next/server";
import { getShiprocketToken } from "@/lib/shiprocket/auth";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("order_id");

  if (!orderId) {
    return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
  }

  // 1️⃣ Get a valid Shiprocket token (cached)
  const token = await getShiprocketToken();

  // 2️⃣ Call tracking API
  const res = await fetch(
    `https://apiv2.shiprocket.in/v1/external/courier/track?order_id=${orderId}`,
    {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ error: data }, { status: 500 });
  }

  return NextResponse.json(data);
}
