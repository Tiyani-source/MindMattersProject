import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area } from "recharts";

const data = [
    { date: "Mar 1", orders: 10, target: 15 },
    { date: "Mar 2", orders: 15, target: 15 },
    { date: "Mar 3", orders: 8, target: 15 },
    { date: "Mar 4", orders: 20, target: 15 },
    { date: "Mar 5", orders: 13, target: 15 },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    
    const ordersData = payload.find(p => p.dataKey === 'orders');
    const targetData = payload.find(p => p.dataKey === 'target');
    
    return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
            <p className="font-semibold text-gray-800">{label}</p>
            {ordersData && (
                <p className="text-blue-600">Orders: {ordersData.value}</p>
            )}
            {targetData && (
                <p className="text-gray-500">Target: {targetData.value}</p>
            )}
        </div>
    );
};

const OrderVolumeChart = () => (
    <div className="w-full h-full p-4">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Daily Order Volume</h3>
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-gray-600">Actual</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <span className="text-sm text-gray-600">Target</span>
                </div>
            </div>
        </div>
        <ResponsiveContainer width="100%" height="90%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                    tick={{ fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                    type="monotone" 
                    dataKey="target" 
                    fill="#f3f4f6" 
                    stroke="#d1d5db" 
                    strokeWidth={2}
                    fillOpacity={0.3}
                    name="Target"
                />
                <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#2563eb' }}
                    name="Orders"
                />
            </LineChart>
        </ResponsiveContainer>
    </div>
);

export default OrderVolumeChart;