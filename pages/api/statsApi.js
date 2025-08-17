// /pages/api/stats.js
import Order from "@/lib/models/order";
import connectDB from "@/lib/database";

const months = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December"
];
const weekDays = [
  "Sunday", "Monday", "Tuesday",
  "Wednesday", "Thursday", "Friday", "Saturday"
];

// ----------- STATS HELPERS ----------- //
const calcStats = (orders) => {
  if (!orders || orders.length === 0) {
    return {
      totalSales: 0,
      totalOrders: 0,
      pendingOrders: 0,
      deliveredOrders: 0,
    };
  }

  let totalSales = 0;
  let pending = 0;
  let delivered = 0;

  orders.forEach((o) => {
    totalSales += o.amount || 0;
    if (o.status === "pending" || o.status === "confirmed") pending++;
    if (o.status === "delivered") delivered++;
  });

  return {
    totalSales,
    totalOrders: orders.length,
    pendingOrders: pending,
    deliveredOrders: delivered,
  };
};

const percentChange = (current, previous) => {
  if (previous === 0) return current > 0 ? "+100%" : "0%";
  return `${(((current - previous) / previous) * 100).toFixed(1)}%`;
};

const getStats = (curr, prev) => {
  return [
    {
      title: "Total Sales",
      value: `₹${curr.totalSales.toLocaleString()}`,
      change: percentChange(curr.totalSales, prev.totalSales),
    },
    {
      title: "Total Orders",
      value: curr.totalOrders.toString(),
      change: percentChange(curr.totalOrders, prev.totalOrders),
    },
    {
      title: "Pending Orders",
      value: curr.pendingOrders.toString(),
      change: percentChange(curr.pendingOrders, prev.pendingOrders),
    },
    {
      title: "Delivered Orders",
      value: curr.deliveredOrders.toString(),
      change: percentChange(curr.deliveredOrders, prev.deliveredOrders),
    },
  ];
};

// ----------- DATE HELPERS ----------- //
const getStartDate = (type, now) => {
  const d = new Date(now);
  switch (type) {
    case "today":
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    case "week":
      return new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7);
    case "day":
      return new Date(d.getFullYear(), d.getMonth(), 1);
    case "monthly":
      return new Date(d.getFullYear(), 0, 1);
    case "year":
    default:
      return new Date(2000, 0, 1);
  }
};

const getPreviousPeriodStartDate = (type, now) => {
  const d = new Date(now);
  switch (type) {
    case "today":
      d.setDate(d.getDate() - 1);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    case "week":
      return new Date(d.getFullYear(), d.getMonth(), d.getDate() - 14);
    case "day":
      return new Date(d.getFullYear(), d.getMonth() - 1, 1);
    case "monthly":
      return new Date(d.getFullYear() - 1, 0, 1);
    case "year":
    default:
      return new Date(2000, 0, 1);
  }
};

// ----------- GENERATE LABELS ----------- //
const generateLabels = (timePeriod, start, end) => {
  const labels = [];
  const d = new Date(start);

  while (d <= end) {
    switch (timePeriod) {
      case "today":
        labels.push(`${d.getHours()}:00`);
        d.setHours(d.getHours() + 1);
        break;
      case "week":
        labels.push(weekDays[d.getDay()]);
        d.setDate(d.getDate() + 1);
        break;
      case "day":
        labels.push(d.getDate().toString());
        d.setDate(d.getDate() + 1);
        break;
      case "monthly":
        labels.push(months[d.getMonth()]);
        d.setMonth(d.getMonth() + 1);
        break;
      case "year":
        labels.push(d.getFullYear().toString());
        d.setFullYear(d.getFullYear() + 1);
        break;
      default:
        break;
    }
  }
  return labels;
};

const getLabel = (date, timePeriod) => {
  const d = new Date(date);
  switch (timePeriod) {
    case "today":
      return `${d.getHours()}:00`;
    case "week":
      return weekDays[d.getDay()];
    case "day":
      return d.getDate().toString();
    case "monthly":
      return months[d.getMonth()];
    case "year":
      return d.getFullYear().toString();
    default:
      return "";
  }
};

// ----------- MAIN HANDLER ----------- //
export default async function handler(req, res) {
  const now = new Date();
  const { timePeriod } = req.query;

  try {
    await connectDB();

    const startDate = getStartDate(timePeriod, now);
    const prevStartDate = getPreviousPeriodStartDate(timePeriod, now);

    const currentOrders = await Order.find({ placedOn: { $gte: startDate } }) || [];
    const previousOrders = await Order.find({
      placedOn: { $gte: prevStartDate, $lt: startDate },
    }) || [];

    const currStats = calcStats(currentOrders);
    const prevStats = calcStats(previousOrders);
    const stats = getStats(currStats, prevStats);

    // 📊 Sales data with 0 fillers
    const labels = generateLabels(timePeriod, startDate, now);
    const salesDataMap = new Map(labels.map(l => [l, { sales: 0, orders: 0 }]));

    currentOrders.forEach(order => {
      const label = getLabel(order.placedOn, timePeriod);
      if (salesDataMap.has(label)) {
        const data = salesDataMap.get(label);
        data.sales += order.amount || 0;
        data.orders += 1;
      }
    });

    const salesData = Array.from(salesDataMap.entries()).map(([label, data]) => ({
      label,
      sales: data.sales,
      orders: data.orders,
    }));

    return res.status(200).json({
      stats,
      salesData,
    });

  } catch (err) {
    console.error("Stats error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
