import React from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const data = {
    labels: ["January", "February", "March", "April", "May"],
    datasets: [
        {
            label: "Sales",
            data: [120, 190, 300, 500, 200],
            backgroundColor: "rgba(53, 162, 235, 0.5)",
        },
    ],
};

const options = {
    responsive: true,
    plugins: {
        legend: { position: "top" },
        title: { display: true, text: "Monthly Sales" },
    },
};

export default function BarChart() {
    return (
        <div>
            <Bar data={data} options={options} />
        </div>
    );
}