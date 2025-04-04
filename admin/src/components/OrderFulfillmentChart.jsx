import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
    { status: "Processing", avgTime: 2 },
    { status: "Shipped", avgTime: 3 },
    { status: "Delivered", avgTime: 5 },
];

const OrderFulfillmentChart = () => (
    <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="avgTime" fill="#4CAF50" />
        </BarChart>
    </ResponsiveContainer>
);

export default OrderFulfillmentChart;