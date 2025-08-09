import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import styles from "@/styles/UI/salesChart.module.css";

export default function SalesChart({ data, timeperiod }) {
    return (
        <Card className={styles.chartCard}>
            <CardHeader>
                <CardTitle>Sales Over Time</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>

                    <LineChart
                        data={data}
                        style={{ borderRadius: "8px" }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey={timeperiod} />
                        <YAxis stroke="#ccc" />
                        <Tooltip
                            contentStyle={{ backgroundColor: "#333", border: "none" }}
                            itemStyle={{ color: "var(--color)" }}
                            labelStyle={{ color: "var(--color)" }}
                        />
                        <Legend wrapperStyle={{ color: "#ccc" }} />

                        <Line type="monotone" dataKey="sales" stroke="#4a90e2" />
                    </LineChart>

                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
