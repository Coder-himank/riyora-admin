import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"; // lowercase "card" if using shadcn
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function SalesChart({ data = [], title = "Sales Over Time" }) {
  return (
    <Card className="shadow-md rounded-2xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="label" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e1e1e",
                border: "none",
                borderRadius: "8px",
              }}
              itemStyle={{ color: "var(--color-primary)" }}
              labelStyle={{ color: "var(--color-primary)" }}
            />
            <Legend wrapperStyle={{ color: "#ccc" }} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#4a90e2"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
