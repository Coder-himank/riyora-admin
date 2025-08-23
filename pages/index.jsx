import styles from "@/styles/Home.module.css";
import StatCard from "@/components/StatCard";
import SalesChart from "@/components/SalesChart";
import OrdersChart from "@/components/OrdersChart";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [timePeriod, setTimePeriod] = useState("month"); // default: monthly

  // Fetch dashboard data in one call
  const fetchDashboardData = async (range = "month") => {
    try {
      setLoading(true);
      const res = await fetch(`/api/dashboardApi?range=${range}`);
      const json = await res.json();

      if (!json.success) throw new Error(json.error || "Failed to fetch data");

      setStats(json.kpis);
      setCharts(json.charts);
    } catch (err) {
      console.error(err);
      toast.error("Error loading dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(timePeriod);
  }, [timePeriod]);

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <h1 className={styles.dashboardTitle}>Admin Dashboard</h1>
        <select
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="today">Today</option>
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
          <option value="year">Yearly</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {stats && (
          <>
            <StatCard
              title="Total Sales"
              value={`₹${stats.totalSales.toLocaleString()}`}
              change={`Change: ${stats.salesChangePct}% vs prev`}
            />
            <StatCard
              title="Total Orders"
              value={stats.totalOrders}
              change={`Change: ${stats.ordersChangePct}% vs prev`}
            />
            <StatCard
              title="Pending Orders"
              value={stats.pendingOrders}
              change="Still pending"
            />
          </>
        )}
      </div>

      {/* Charts Grid */}
      <div className={styles.chartsGrid}>
        {charts && (
          <>
            <OrdersChart
              data={charts.orders}
              previousData={charts.previousOrders}
              timePeriod={timePeriod}
            />
            <SalesChart
              data={charts.sales}
              previousData={charts.previousSales}
              timePeriod={timePeriod}
            />
          </>
        )}
      </div>
    </div>
  );
}
