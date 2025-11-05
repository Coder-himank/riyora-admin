import { getShiprocketToken } from "@/lib/shiprocket/auth";

// ✅ Safe fetch utility with timeout
async function safeFetch(url, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw new Error("Shiprocket request timeout or network error");
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      pincode,
      weight = 0.2,
      length = 10,
      breadth = 10,
      height = 10,
      cod = false
    } = req.body || {};

    // ✅ Validate inputs
    if (!pincode || typeof pincode !== "string" || pincode.length !== 6) {
      return res.status(400).json({ message: "Invalid pincode" });
    }

    if (Number(weight) <= 0) {
      return res.status(400).json({ message: "Invalid weight" });
    }

    const token = await getShiprocketToken();

    const url =
      `https://apiv2.shiprocket.in/v1/external/courier/serviceability` +
      `?pickup_postcode=${process.env.SHIPROCKET_PICKUP_PINCODE}` +
      `&delivery_postcode=${encodeURIComponent(pincode)}` +
      `&weight=${Number(weight)}` +
      `&length=${Number(length)}` +
      `&breadth=${Number(breadth)}` +
      `&height=${Number(height)}` +
      `&cod=${cod ? 1 : 0}`;

    const response = await safeFetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await response.json();

    if (!response.ok || !data?.data) {
      console.error("Shiprocket API Error:", data);
      return res.status(response.status || 500).json({
        message: "Failed to fetch courier rates",
        error: data?.message || "Unknown error"
      });
    }

    const companies = data?.data?.available_courier_companies || [];

    if (!companies.length) {
      return res.status(404).json({
        message: "No courier options available for this route"
      });
    }

    // ✅ Normalize response with best options
    const courierOptions = companies.map((service) => ({
      courier: service.courier_name,
      rate: parseFloat(service.rate) || 0,
      codCharges: cod ? parseFloat(service.cod_charges || 0) : 0,
      totalCost: parseFloat(service.rate) + (cod ? parseFloat(service.cod_charges || 0) : 0),
      estDelivery: `${service.estimated_delivery_days} days`,
      mode: service.mode, // surface / air
      serviceType: service.service_type
    }));

    const cheapest = [...courierOptions].sort((a, b) => a.totalCost - b.totalCost)[0];
    const fastest = [...courierOptions].sort((a, b) => 
      parseInt(a.estDelivery) - parseInt(b.estDelivery)
    )[0];

    return res.status(200).json({
      message: "Courier options fetched successfully",
      totalOptions: courierOptions.length,
      cheapestOption: cheapest,
      fastestOption: fastest,
      options: courierOptions
    });

  } catch (error) {
    console.error("Internal error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}
