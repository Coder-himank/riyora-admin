// /pages/api/order.js
import { handleShiprocketAction } from "@/lib/orderHelper";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }



  try {
    const { orderId, type, options } = req.body;

    console.log(req.body);

    if (!orderId || !type) {
      return res.status(400).json({ ok: false, error: "Missing orderId or type" });
    }

    const order = await handleShiprocketAction(orderId, type, options || {});
    return res.status(200).json({ ok: true, order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
