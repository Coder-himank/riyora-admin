
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        // 🟢 Extract details from request body
        const { pincode, weight, amount } = req.body;

        if (!pincode || !weight) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // 🟡 Mock courier partner data (replace with real API calls)
        const courierPartners = [
            {
                name: "Delhivery",
                price: 60 + weight * 5,
                estDelivery: "3-5 days",
            },
            {
                name: "Bluedart",
                price: 80 + weight * 6,
                estDelivery: "2-4 days",
            },
            {
                name: "XpressBees",
                price: 50 + weight * 4,
                estDelivery: "4-6 days",
            },
            {
                name: "Ecom Express",
                price: 70 + weight * 5,
                estDelivery: "3-5 days",
            },
        ];

        return res.status(200).json({
            message: "Courier options fetched successfully",
            options: courierPartners,
        });
    } catch (error) {
        console.error("Error fetching courier rates:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
