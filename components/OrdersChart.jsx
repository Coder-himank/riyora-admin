"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function OrdersChart({ data = [], previousData = [] }) {
  const [view, setView] = useState("month"); // "day" | "month" | "year"

  // Merge current and previous data for comparison
  const mergedData = data.map((item, index) => ({
    label: item.label,
    orders: item.value,
    previousOrders: previousData[index]?.value || 0,
  }));

  return (
    <Card className="shadow-md rounded-2xl">
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Orders Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mergedData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="label" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e1e1e", border: "none", borderRadius: "8px" }}
              itemStyle={{ color: "var(--color-primary)" }}
              labelStyle={{ color: "var(--color-primary)" }}
            />
            <Legend wrapperStyle={{ color: "#ccc" }} />
            <Bar dataKey="orders" fill="#82ca9d" name="Current" />
            <Bar dataKey="previousOrders" fill="#8884d8" name="Previous" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
