import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import styles from "@/styles/UI/ordersChart.module.css";

export default function OrdersChart({ data }) {
    return (
        <Card className={styles.chartCard}>
            <CardHeader>
                <CardTitle>Orders Over Time</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={data}
                        style={{ borderRadius: "8px" }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="month" stroke="#ccc" />
                        <YAxis stroke="#ccc" />
                        <Tooltip
                            contentStyle={{ backgroundColor: "#333", border: "none" }}
                            itemStyle={{ color: "#fff" }}
                            labelStyle={{ color: "#fff" }}
                        />
                        <Legend wrapperStyle={{ color: "#ccc" }} />
                        <Bar dataKey="orders" fill="#82ca9d" />
                    </BarChart>

                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
