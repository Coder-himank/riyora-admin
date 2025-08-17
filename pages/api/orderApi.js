import Order from "@/lib/models/order";
import connectDB from "@/lib/database";


function getDateRange(filterType) {
    const now = new Date();
    let startDate, endDate;

    switch (filterType) {
        case "today":
            startDate = new Date(now.setHours(0, 0, 0, 0));
            endDate = new Date(now.setHours(23, 59, 59, 999));
            break;

        case "week": {
            const currentDay = now.getDay();
            const diffToMonday = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
            startDate = new Date(now.setDate(diffToMonday));
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
            break;
        }

        case "month":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            break;

        case "year":
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
            break;

        default:
            startDate = new Date(0);
            endDate = new Date();
    }

    return { startDate, endDate };
}
// pages/api/orders.js
export default async function handler(req, res) {
    await connectDB();

    if (req.method === "GET") {


        try {
            const { filter, orderId } = req.query;

            // Get a specific order by ID
            if (orderId) {
                const order = await Order.findById(orderId);

                if (!order) {
                    return res.status(404).json({ error: "Order not found" });
                }

                return res.status(200).json(order);
            }

            // Get date range for filter
            const { startDate, endDate } = getDateRange(filter);

            // Fetch orders in date range
            const orders = await Order.find({
                placedOn: {
                    $gte: startDate,
                    $lte: endDate
                }
            });

            // Aggregate statistics
            const stats = {
                orders,
                totalSales: orders.reduce((sum, order) => sum + order.totalAmount, 0),
                totalOrders: orders.length,
                pendingOrders: orders.filter(o => o.status === "pending").length,
                shippedOrders: orders.filter(o => o.status === "shipped").length,
            };

            return res.status(200).json(stats);

        } catch (error) {
            console.error("Failed to fetch orders:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }



    if (req.method !== "PUT") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const { orderId, updatedFields } = req.body;

        if (!orderId || !updatedFields) {
            return res.status(400).json({ message: "Missing orderId or fields" });
        }

        const ord = await Order.findByIdAndUpdate(
            orderId,
            {
                $set: updatedFields,
                $push: {
                    orderHistory: {
                        status: updatedFields.status || "updated",
                        note: `Order updated: ${Object.keys(updatedFields).join(", ")}`
                    }
                }
            },
            { new: true, runValidators: true }
        );

        if (!ord) {
            return res.status(404).json({ message: "Order not found" });
        }

        return res.status(200).json({ message: "Order updated successfully", order: ord });
    } catch (err) {
        console.error("Update error:", err);
        return res.status(500).json({ message: "Server error" });
    }
    return res.status(405).json({ error: "Method Not Allowed" });

}