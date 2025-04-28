import React, { useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const CancellationRateChart = () => {
    // Sample data - replace with actual data from your backend
    const [timeRange, setTimeRange] = useState('month');

    const monthlyData = [
        { name: 'Jan', cancellations: 12, total: 400, rate: 3.0 },
        { name: 'Feb', cancellations: 15, total: 450, rate: 3.3 },
        { name: 'Mar', cancellations: 8, total: 500, rate: 1.6 },
        { name: 'Apr', cancellations: 10, total: 480, rate: 2.1 },
        { name: 'May', cancellations: 14, total: 520, rate: 2.7 },
        { name: 'Jun', cancellations: 9, total: 510, rate: 1.8 },
    ];

    const weeklyData = [
        { name: 'Week 1', cancellations: 3, total: 120, rate: 2.5 },
        { name: 'Week 2', cancellations: 4, total: 130, rate: 3.1 },
        { name: 'Week 3', cancellations: 2, total: 125, rate: 1.6 },
        { name: 'Week 4', cancellations: 3, total: 135, rate: 2.2 },
    ];

    const dailyData = [
        { name: 'Mon', cancellations: 1, total: 40, rate: 2.5 },
        { name: 'Tue', cancellations: 2, total: 45, rate: 4.4 },
        { name: 'Wed', cancellations: 0, total: 42, rate: 0.0 },
        { name: 'Thu', cancellations: 1, total: 38, rate: 2.6 },
        { name: 'Fri', cancellations: 2, total: 50, rate: 4.0 },
        { name: 'Sat', cancellations: 1, total: 35, rate: 2.9 },
        { name: 'Sun', cancellations: 0, total: 30, rate: 0.0 },
    ];

    const data = timeRange === 'month' ? monthlyData : timeRange === 'week' ? weeklyData : dailyData;

    const cancellationReasons = [
        { name: 'Price Issues', value: 35 },
        { name: 'Delivery Time', value: 25 },
        { name: 'Product Issues', value: 20 },
        { name: 'Customer Changed Mind', value: 15 },
        { name: 'Other', value: 5 },
    ];

    const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                    <p className="font-semibold text-gray-800">{label}</p>
                    <p className="text-sm text-gray-600">Cancellations: {payload[0].value}</p>
                    <p className="text-sm text-gray-600">Total Orders: {payload[1].value}</p>
                    <p className="text-sm font-semibold text-red-600">
                        Cancellation Rate: {payload[2].value}%
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Cancellation Analysis</h3>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setTimeRange('day')}
                        className={`px-3 py-1 rounded-md text-sm ${
                            timeRange === 'day'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Daily
                    </button>
                    <button
                        onClick={() => setTimeRange('week')}
                        className={`px-3 py-1 rounded-md text-sm ${
                            timeRange === 'week'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Weekly
                    </button>
                    <button
                        onClick={() => setTimeRange('month')}
                        className={`px-3 py-1 rounded-md text-sm ${
                            timeRange === 'month'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Monthly
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cancellation Trend Chart */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Cancellation Trend</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar
                                dataKey="cancellations"
                                name="Cancellations"
                                fill="#FF6B6B"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="total"
                                name="Total Orders"
                                fill="#4ECDC4"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="rate"
                                name="Cancellation Rate (%)"
                                fill="#45B7D1"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Cancellation Reasons Pie Chart */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Cancellation Reasons</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={cancellationReasons}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {cancellationReasons.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700">Average Cancellation Rate</h4>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                        {data.reduce((acc, curr) => acc + curr.rate, 0) / data.length}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">↓ 1.2% from last period</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700">Total Cancellations</h4>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                        {data.reduce((acc, curr) => acc + curr.cancellations, 0)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">↓ 15% from last period</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700">Most Common Reason</h4>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                        {cancellationReasons[0].name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{cancellationReasons[0].value}% of cancellations</p>
                </div>
            </div>
        </div>
    );
};

export default CancellationRateChart;