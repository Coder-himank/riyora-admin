// app/api/analytics/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/database";
import Order from "@/models/order";

/**
 * Helper utilities:
 * - buildDateRange(range, tz)
 * - buildGroupFormat(range)
 * - aggregateRange(start, end, groupFormat, tz)
 * - fillBuckets(list, start, end, range, tz)
 * - compareSeries(currentSeries, previousSeries)
 *
 * Response shape:
 * {
 *   success: true,
 *   meta: { range: "today", start, end, timezone },
 *   totals: { totalOrders, totalSales, prevTotalOrders, prevTotalSales, ordersChangePct, salesChangePct },
 *   series: [ { label: "...", orders, sales } ],        // current period series
 *   previousSeries: [ { label: "...", orders, sales } ] // previous period (same length)
 * }
 */

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function cloneDate(d) { return new Date(d.getTime()); }

function addHours(d, h) { const x = cloneDate(d); x.setHours(x.getHours() + h); return x; }
function addDays(d, n) { const x = cloneDate(d); x.setDate(x.getDate() + n); return x; }
function addMonths(d, n) { const x = cloneDate(d); x.setMonth(x.getMonth() + n); return x; }
function addYears(d, n) { const x = cloneDate(d); x.setFullYear(x.getFullYear() + n); return x; }

/** build date ranges for current and previous period */
function buildDateRange(range, tz = "Asia/Kolkata") {
  // We'll compute in server TZ but keep exact Date objects.
  const now = new Date();
  // Use local time to derive "today" in requested timezone -- Mongo accepts timezone in $dateToString
  // For simplicity we assume server timezone alignment; if you need strict TZ arithmetic use moment-timezone.
  let currentStart, currentEnd, prevStart, prevEnd;
  if (range === "today") {
    currentStart = startOfDay(now);
    currentEnd = endOfDay(now);
    prevStart = startOfDay(addDays(currentStart, -1));
    prevEnd = endOfDay(addDays(currentStart, -1));
  } else if (range === "week") {
    // last 7 days including today
    currentEnd = endOfDay(now);
    currentStart = startOfDay(addDays(currentEnd, -6));
    prevEnd = endOfDay(addDays(currentStart, -1));
    prevStart = startOfDay(addDays(currentStart, -7));
  } else if (range === "month") {
    // current month (1st to last day)
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    currentStart = startOfDay(first);
    currentEnd = endOfDay(last);
    // previous month
    const pf = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const pl = new Date(now.getFullYear(), now.getMonth(), 0);
    prevStart = startOfDay(pf);
    prevEnd = endOfDay(pl);
  } else if (range === "year") {
    const first = new Date(now.getFullYear(), 0, 1);
    const last = new Date(now.getFullYear(), 11, 31);
    currentStart = startOfDay(first);
    currentEnd = endOfDay(last);
    // previous year
    const pf = new Date(now.getFullYear() - 1, 0, 1);
    const pl = new Date(now.getFullYear() - 1, 11, 31);
    prevStart = startOfDay(pf);
    prevEnd = endOfDay(pl);
  } else if (range === "all") {
    // All time: use earliest order date as start
    currentStart = new Date(0); // placeholder; will be replaced after reading DB
    currentEnd = endOfDay(now);
    // previous period: matched duration before currentStart - not applicable, but we'll compare last N years
    prevStart = null;
    prevEnd = null;
  } else {
    throw new Error("Invalid range");
  }

  return { currentStart, currentEnd, prevStart, prevEnd, timezone: tz };
}

/** picks dateToString format and increments */
function buildGroupFormat(range) {
  if (range === "today") return { fmt: "%Y-%m-%dT%H:00:00", unit: "hour" };
  if (range === "week" || range === "month") return { fmt: "%Y-%m-%d", unit: "day" };
  if (range === "year") return { fmt: "%Y-%m", unit: "month" };
  if (range === "all") return { fmt: "%Y", unit: "year" };
  return { fmt: "%Y-%m", unit: "month" };
}

/** Aggregates orders in [start, end] grouped by groupFormat using timezone */
async function aggregateRange(start, end, groupFormat, tz = "Asia/Kolkata") {
  const match = { createdAt: { $gte: start, $lte: end } };
  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: {
          $dateToString: { format: groupFormat, date: "$createdAt", timezone: tz },
        },
        orders: { $sum: 1 },
        sales: { $sum: "$amount" },
      },
    },
    { $sort: { _id: 1 } },
  ];
  const res = await Order.aggregate(pipeline);
  return res.map((r) => ({ label: r._id, orders: r.orders, sales: r.sales }));
}

/** Generate array of labels between start and end based on unit */
function generateLabels(start, end, unit, tz = "Asia/Kolkata") {
  const labels = [];
  const s = new Date(start);
  const e = new Date(end);

  if (unit === "hour") {
    const cur = new Date(s);
    cur.setMinutes(0, 0, 0);
    while (cur <= e) {
      labels.push(formatHourLabel(cur));
      cur.setHours(cur.getHours() + 1);
    }
  } else if (unit === "day") {
    const cur = new Date(s);
    cur.setHours(0, 0, 0, 0);
    while (cur <= e) {
      labels.push(formatDayLabel(cur));
      cur.setDate(cur.getDate() + 1);
    }
  } else if (unit === "month") {
    let cur = new Date(s.getFullYear(), s.getMonth(), 1);
    const endMonth = new Date(e.getFullYear(), e.getMonth(), 1);
    while (cur <= endMonth) {
      labels.push(formatMonthLabel(cur));
      cur = addMonths(cur, 1);
    }
  } else if (unit === "year") {
    let cur = new Date(s.getFullYear(), 0, 1);
    const endYear = new Date(e.getFullYear(), 0, 1);
    while (cur <= endYear) {
      labels.push(String(cur.getFullYear()));
      cur = addYears(cur, 1);
    }
  }
  return labels;
}

/** Formatting functions for labels */
function pad(n) { return n < 10 ? "0" + n : String(n); }
function formatHourLabel(d) {
  // e.g. 2025-08-23T09:00:00
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:00:00`;
}
function formatDayLabel(d) {
  // e.g. 2025-08-23
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function formatMonthLabel(d) {
  // e.g. 2025-08
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

/** Merge aggregated results into a filled series with zeros for missing buckets */
function fillSeries(aggArray, labels) {
  const map = new Map();
  for (const r of aggArray) map.set(r.label, { orders: r.orders, sales: r.sales });

  const filled = labels.map((label) => {
    const v = map.get(label);
    return { label, orders: v ? v.orders : 0, sales: v ? v.sales : 0 };
  });
  return filled;
}

/** Sum totals for a series */
function sumSeries(series) {
  return series.reduce(
    (acc, cur) => {
      acc.orders += Number(cur.orders || 0);
      acc.sales += Number(cur.sales || 0);
      return acc;
    },
    { orders: 0, sales: 0 }
  );
}

/** compute percentage change safely */
function pctChange(current, previous) {
  if (previous === 0) return current === 0 ? 0 : 100; // from 0 -> X => 100% (or define as null)
  return ((current - previous) / Math.abs(previous)) * 100;
}

/** compare two series aligned by label (both must same length & labels) */
function compareSeries(currentSeries, previousSeries) {
  // returns totals and per-label diff if needed
  const curTotals = sumSeries(currentSeries);
  const prevTotals = sumSeries(previousSeries);
  return {
    totals: {
      totalOrders: curTotals.orders,
      totalSales: curTotals.sales,
      prevTotalOrders: prevTotals.orders,
      prevTotalSales: prevTotals.sales,
      ordersChangePct: Number(pctChange(curTotals.orders, prevTotals.orders).toFixed(2)),
      salesChangePct: Number(pctChange(curTotals.sales, prevTotals.sales).toFixed(2)),
    },
  };
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "today";
    const tz = searchParams.get("tz") || "Asia/Kolkata";

    // Build ranges
    let { currentStart, currentEnd, prevStart, prevEnd } = buildDateRange(range, tz);

    // If 'all', derive start from DB earliest order
    if (range === "all") {
      const earliest = await Order.findOne().sort({ createdAt: 1 }).select({ createdAt: 1 }).lean();
      if (!earliest) {
        // no data
        return NextResponse.json({
          success: true,
          meta: { range, timezone: tz },
          totals: { totalOrders: 0, totalSales: 0, prevTotalOrders: 0, prevTotalSales: 0, ordersChangePct: 0, salesChangePct: 0 },
          series: [],
          previousSeries: [],
        });
      }
      currentStart = startOfDay(earliest.createdAt);
      // For comparison, previous period = previous N years (we'll create prevStart/prevEnd as empty for all)
      // We'll compare year-over-year totals for last N years automatically by aggregating years
    }

    const { fmt: groupFormat, unit } = buildGroupFormat(range);

    // Aggregate current period
    const currentAgg = await aggregateRange(currentStart, currentEnd, groupFormat, tz);

    // Aggregate previous period
    let previousAgg = [];
    if (prevStart && prevEnd) {
      previousAgg = await aggregateRange(prevStart, prevEnd, groupFormat, tz);
    } else if (range === "all") {
      // previousAgg = aggregate all years excluding latest N years? For simplicity aggregate all and we'll present yearly series
      // We'll just compute yearly aggregation (groupFormat "%Y") and compare year over year
      // For 'all' we already set groupFormat to "%Y" above.
      previousAgg = []; // not needed
    }

    // Build labels for the current period
    const labels = generateLabels(currentStart, currentEnd, unit, tz);

    const currentSeries = fillSeries(currentAgg, labels);

    // For previous series, we need labels aligned with current labels:
    // Strategy: shift previous period window to match current window length and generate labels for previousStart..previousEnd
    let prevLabels = [];
    let prevSeries = [];
    if (prevStart && prevEnd) {
      prevLabels = generateLabels(prevStart, prevEnd, unit, tz);
      // If previous has same number of labels as current, keep them aligned.
      // If not (e.g., month lengths differ), align by index: left-pad or right-pad as needed.
      prevSeries = fillSeries(previousAgg, prevLabels);

      // Align lengths: if different sizes, try to align by mapping index (most cases equal)
      if (prevSeries.length !== currentSeries.length) {
        // If prev shorter, pad front or back with zeros to match current length
        const diff = currentSeries.length - prevSeries.length;
        if (diff > 0) {
          // pad at start
          const padArray = new Array(diff).fill({ orders: 0, sales: 0 }).map((v, i) => {
            return { label: `prev-pad-${i}`, orders: 0, sales: 0 };
          });
          prevSeries = padArray.concat(prevSeries);
        } else if (diff < 0) {
          // truncate prevSeries to match tail
          prevSeries = prevSeries.slice(-currentSeries.length);
        }
      }
    } else if (range === "all") {
      // currentSeries contains yearly buckets. previousSeries can be empty; for 'all' we'll produce previousSeries as zeros.
      prevSeries = currentSeries.map((__) => ({ label: "prev", orders: 0, sales: 0 }));
    } else {
      // fallback: previous zeros
      prevSeries = currentSeries.map((_) => ({ label: "prev", orders: 0, sales: 0 }));
    }

    // Compute comparisons
    const comparison = compareSeries(currentSeries, prevSeries);

    return NextResponse.json({
      success: true,
      meta: {
        range,
        timezone: tz,
        currentStart: currentStart.toISOString(),
        currentEnd: currentEnd.toISOString(),
        prevStart: prevStart ? prevStart.toISOString() : null,
        prevEnd: prevEnd ? prevEnd.toISOString() : null,
        unit,
      },
      totals: comparison.totals,
      series: currentSeries,
      previousSeries: prevSeries,
    });
  } catch (err) {
    console.error("Analytics API error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
