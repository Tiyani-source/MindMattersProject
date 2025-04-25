import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
    { type: "Requested", count: 30 },
    { type: "Approved", count: 25 },
];

const RefundsChart = () => (
    <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#FFC107" />
        </BarChart>
    </ResponsiveContainer>
);

export default RefundsChart;