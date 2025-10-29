import { getShiprocketToken } from "@/lib/shiprocket/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // 🟢 Extract details from request body
    const { pincode, weight =0.2, length = 10, breadth = 10, height = 10, cod = false } = req.body;

    if (!pincode || !weight) {
      return res.status(400).json({ message: "Missing required fields: pincode or weight" });
    }

    // 1️⃣ Get Shiprocket token
    const token = await getShiprocketToken();

        const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability?pickup_postcode=${process.env.SHIPROCKET_PICKUP_PINCODE}&delivery_postcode=${pincode}&weight=${weight}&length=${length}&breadth=${breadth}&height=${height}&cod=${Number(cod)}`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });


    // 2️⃣ Call Shiprocket serviceability API


    const data = await response.json();

    if (!response.ok) {
      console.error("Shiprocket API error:", data);
      return res.status(500).json({ message: "Failed to fetch courier rates", details: data });
    }

    // 3️⃣ Map response to a friendly format

    console.log(JSON.stringify(data, null, 2));
    const courierOptions = data.data.available_courier_companies.map((service) => ({
      name: service.courier_name,
      price: service.rate,
      estDelivery: `${service.estimated_delivery_days} days`,
      serviceType: service.service_type,
    }));

    return res.status(200).json({
      message: "Courier options fetched successfully",
      options: courierOptions,
    });
  } catch (error) {
    console.error("Error fetching courier rates:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
