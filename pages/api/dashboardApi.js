import connectDB from "@/lib/database";
import Order from "@/lib/models/order";
import {
  buildDateRange,
  buildGroupFormat,
  aggregateRange,
  generateLabels,
  fillSeries,
  compareSeries,
} from "@/lib/analyticsHelpers";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" }); // 405 instead of 401
  }

  try {
    await connectDB();
    const { range = "month", tz = "Asia/Kolkata" } = req.query;

    // 1. Compute ranges
    const { currentStart, currentEnd, prevStart, prevEnd } = buildDateRange(range, tz);
    const { fmt: groupFormat, unit } = buildGroupFormat(range);

    // 2. Aggregate current + previous
    const currentAgg = await aggregateRange(currentStart, currentEnd, groupFormat, tz);
    const previousAgg =
      prevStart && prevEnd ? await aggregateRange(prevStart, prevEnd, groupFormat, tz) : [];

    // 3. Generate labels and fill
    const labels = generateLabels(currentStart, currentEnd, unit, tz);
    const currentSeries = fillSeries(currentAgg, labels);
    const previousSeries = fillSeries(previousAgg, labels);

    // 4. Compare series
    const { totals } = compareSeries(currentSeries, previousSeries);

    // 5. Pending orders
    const pendingOrders = await Order.countDocuments({ status: "pending" });

    // 6. Response
    return res.status(200).json({
      success: true,
      meta: { range, unit, timezone: tz },
      kpis: {
        totalOrders: totals.totalOrders,
        totalSales: totals.totalSales,
        pendingOrders,
        prevOrders: totals.prevTotalOrders,
        prevSales: totals.prevTotalSales,
        ordersChangePct: totals.ordersChangePct,
        salesChangePct: totals.salesChangePct,
      },
      charts: {
        orders: currentSeries.map((d) => ({ label: d.label, value: d.orders })),
        sales: currentSeries.map((d) => ({ label: d.label, value: d.sales })),
        previousOrders: previousSeries.map((d) => ({ label: d.label, value: d.orders })),
        previousSales: previousSeries.map((d) => ({ label: d.label, value: d.sales })),
      },
    });
  } catch (err) {
    console.error("Dashboard API error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
