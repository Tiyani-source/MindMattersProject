import React from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";

// ✅ Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RefundReturnsBarChart = () => {
    const data = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], // X-Axis (Months)
        datasets: [
            {
                label: "Refund Requests",
                data: [30, 25, 40, 35, 20, 30], // Example: Refund requests per month
                backgroundColor: "#0096A5", 
                hoverBackgroundColor: "#007985",
                borderRadius: 6,
            },
            {
                label: "Completed Refunds",
                data: [20, 18, 30, 28, 15, 25], // Example: Refunds processed by admin
                backgroundColor: "#F4A261", 
                hoverBackgroundColor: "#E08C50",
                borderRadius: 6,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Months",
                },
            },
            y: {
                title: {
                    display: true,
                    text: "Number of Refunds",
                },
                beginAtZero: true,
            },
        },
    };

    return (
        <div className="p-6 bg-white shadow-lg rounded-lg flex justify-center items-center w-full max-w-[1200px] h-[500px] mx-auto">
    <h3 className="text-lg font-semibold mb-4 text-center">Refunds: Requested vs. Approved</h3>
    <div className="w-full h-full">
        <Bar data={data} options={{ responsive: true, maintainAspectRatio: false }} />
    </div>
</div>
    );
};

export default RefundReturnsBarChart;