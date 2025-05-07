import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
    { name: "Cancelled", value: 20, color: "#ef4444" },
    { name: "Completed", value: 80, color: "#10b981" },
];

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const percentage = ((data.value / 100) * 100).toFixed(1);
        return (
            <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
                <p className="font-semibold text-gray-800">{data.name}</p>
                <p className="text-gray-600">Count: {data.value}</p>
                <p className="text-gray-600">Percentage: {percentage}%</p>
            </div>
        );
    }
    return null;
};

const CustomLegend = ({ payload }) => (
    <div className="flex justify-center gap-4 mt-4">
        {payload.map((entry, index) => (
            <div key={`legend-${index}`} className="flex items-center gap-2">
                <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600">
                    {entry.value} ({((entry.payload.value / 100) * 100).toFixed(1)}%)
                </span>
            </div>
        ))}
    </div>
);

const CancellationRateChartAppointments = () => (
    <div className="w-full h-full p-4">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Order Completion Rate</h3>
            <div className="text-sm text-gray-500">
                Last 30 Days
            </div>
        </div>
        <ResponsiveContainer width="100%" height="90%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            stroke="#fff"
                            strokeWidth={2}
                        />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
            </PieChart>
        </ResponsiveContainer>
    </div>
);

export default CancellationRateChartAppointments;