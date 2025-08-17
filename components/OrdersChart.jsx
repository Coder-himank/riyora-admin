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
                        <XAxis dataKey="month" stroke="#000000ff" />
                        <YAxis stroke="#000000ff" />
                        <Tooltip
                            contentStyle={{ backgroundColor: "#333", border: "none" }}
                            itemStyle={{ color: "#000000ff" }}
                            labelStyle={{ color: "#000000ff" }}
                        />
                        <Legend wrapperStyle={{ color: "#2b2b2bff" }} />
                        <Bar dataKey="orders" fill="#82ca9d" />
                    </BarChart>

                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
