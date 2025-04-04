import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const data = [
    { name: "Cancelled", value: 20 },
    { name: "Completed", value: 80 },
];

const COLORS = ["#FF4C4C", "#4CAF50"];

const CancellationRateChart = () => (
    <ResponsiveContainer width="100%" height={300}>
        <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value">
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
            <Tooltip />
        </PieChart>
    </ResponsiveContainer>
);

export default CancellationRateChart;