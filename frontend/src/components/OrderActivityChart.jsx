import React from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

// ✅ Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const OrderActivityChart = () => {
    const data = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
        datasets: [
            {
                label: "Orders Placed",
                data: [10, 15, 7, 20, 25, 18, 30], // Example data
                borderColor: "rgba(0, 150, 165, 1)",
                backgroundColor: "rgba(0, 121, 133, 1)",
                tension: 0.4,
            },
            {
                label: "Orders Completed",
                data: [8, 12, 5, 18, 22, 15, 28],
                borderColor: "rgba(255, 111, 97, 1)",
                backgroundColor: "rgba(228, 91, 80, 1)",
                tension: 0.4,
            },
        ],
    };

    return (
        <div className="p-6 bg-white shadow-lg rounded-lg flex justify-center items-center w-full max-w-[1200px] h-[500px] mx-auto">
            <h3 className="text-lg font-semibold mb-4 text-center">Order Activity Trend</h3>
                <div className="w-full h-full">
                <Line data={data} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
        </div>
    );
};

export default OrderActivityChart;