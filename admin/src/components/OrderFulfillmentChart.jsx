import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const data = [
    { status: "Processing", avgTime: 2, target: 1.5 },
    { status: "Shipped", avgTime: 3, target: 2.5 },
    { status: "Delivered", avgTime: 5, target: 4 },
];

const COLORS = ['#3b82f6', '#10b981', '#6366f1'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
                <p className="font-semibold text-gray-800">{label}</p>
                <p className="text-green-600">Average Time: {payload[0].value} days</p>
                <p className="text-gray-500">Target: {payload[0].payload.target} days</p>
            </div>
        );
    }
    return null;
};

const OrderFulfillmentChart = () => (
    <div className="w-full h-full p-4">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Order Fulfillment Timeline</h3>
            <div className="text-sm text-gray-500">
                Average Days per Status
            </div>
        </div>
        <ResponsiveContainer width="100%" height="90%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                    dataKey="status" 
                    tick={{ fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                    tick={{ fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    label={{ value: 'Days', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avgTime" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    </div>
);

export default OrderFulfillmentChart;