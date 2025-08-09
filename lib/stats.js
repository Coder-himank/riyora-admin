// Helper to fetch orders from API
async function fetchOrders() {
    try {
        const response = await fetch("https://api.example.com/orders"); // Replace with your API
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const orders = await response.json();
        return orders;
    } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
    }
}

// Helper: filter orders by date range
function filterOrdersByDate(orders, { startDate, endDate }) {
    return orders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= startDate && orderDate <= endDate;
    });
}

// Helper: get start and end dates based on filter type
function getDateRange(filterType) {
    const now = new Date();
    let startDate, endDate;

    switch (filterType) {
        case "today":
            startDate = new Date(now.setHours(0, 0, 0, 0));
            endDate = new Date(now.setHours(23, 59, 59, 999));
            break;
        case "week":
            const firstDay = now.getDate() - now.getDay();
            startDate = new Date(now.setDate(firstDay));
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(now.setDate(firstDay + 6));
            endDate.setHours(23, 59, 59, 999);
            break;
        case "month":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            break;
        case "year":
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
            break;
        default:
            startDate = new Date(0); // No filter (all time)
            endDate = new Date();
    }
    return { startDate, endDate };
}

// Main function to get order stats
async function getOrderStats(filterType = "all") {
    const orders = await fetchOrders();
    const { startDate, endDate } = getDateRange(filterType);
    const filteredOrders = filterOrdersByDate(orders, { startDate, endDate });

    const stats = {
        totalSales: filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0),
        totalOrders: filteredOrders.length,
        pendingOrders: filteredOrders.filter(order => order.status === "pending").length,
        shippedOrders: filteredOrders.filter(order => order.status === "shipped").length,
    };

    return stats;
}

// Example usage:
getOrderStats("month").then(stats => console.log(stats));
