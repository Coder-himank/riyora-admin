import styles from "@/styles/Home.module.css";
import StatCard from "@/components/StatCard";
import SalesChart from "@/components/SalesChart";
import OrdersChart from "@/components/OrdersChart";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
export default function AdminDashboard() {

  const [loading, setLoading] = useState(true)
  const [salesData, setSalesData] = useState([])
  const [stats, setStats] = useState([])
  const [timePeriod, setTimePeriod] = useState("month")


  const fetchStats = async (timePeriod) => {
    try {
      setLoading(true)
      const res = await axios.get(`/api/statsApi?timePeriod=${timePeriod}`);
      setStats(res.data.stats)
      setSalesData(res.data.salesData)

      console.log(res.data);


    } catch (err) {
      toast.error("error fetching data" + err)
    }
    finally {
      setLoading(false)

    }
  }


  useEffect(() => {
    fetchStats("monthly")
  }, [])

  const updateStats = async (e) => {
    setTimePeriod(e.target.value)
    fetchStats(e.target.value)
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <h1 className={styles.dashboardTitle}>Admin Dashboard</h1>
        <select onChange={updateStats}>
          <option value="allTime">All Time</option>
          <option value="today">Today</option>
          <option value="week">weekly</option>
          <option value="day">Days</option>
          <option value="month">Monthly</option>
          <option value="year">Yearly</option>
        </select>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div className={styles.chartsGrid}>
        <SalesChart data={salesData} timeperiod />
        <OrdersChart data={salesData} timeperiod />
      </div>
    </div>
  );
}
