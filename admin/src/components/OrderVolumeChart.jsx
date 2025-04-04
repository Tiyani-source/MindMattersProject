import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
    { date: "Mar 1", orders: 10 },
    { date: "Mar 2", orders: 15 },
    { date: "Mar 3", orders: 8 },
    { date: "Mar 4", orders: 20 },
    { date: "Mar 5", orders: 13 },
];

const OrderVolumeChart = () => (
    <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} />
        </LineChart>
    </ResponsiveContainer>
);

export default OrderVolumeChart;