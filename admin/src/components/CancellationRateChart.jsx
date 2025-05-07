import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
    const [orders, setOrders] = useState([]);
    const [timeRange, setTimeRange] = useState('month');
    const token = localStorage.getItem('token');

    const cancelReasons = [
        "Incorrect delivery address",
        "Duplicate order",
        "Payment issue",
        "Ordered by mistake",
        "Product or service unavailable",
        "Delayed delivery or service",
        "Customer no longer needs the order",
        "Invalid or suspicious order activity",
        "Unable to reach customer",
        "Other"
    ];

    useEffect(() => {
        axios.get('http://localhost:4000/api/orders/all', token ? { headers: { Authorization: `Bearer ${token}` } } : {})
            .then(res => {
                if (res.data.success) setOrders(res.data.orders || []);
                else setOrders([]);
            })
            .catch(err => {
                setOrders([]);
                console.error('Order fetch error:', err);
            });
    }, [token]);

    // Process data for charts
    const processData = () => {
        const now = new Date();
        const filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.date);
            if (timeRange === 'month') {
                return orderDate >= new Date(now.getFullYear(), now.getMonth() - 1, 1);
            } else if (timeRange === 'week') {
                return orderDate >= new Date(now.setDate(now.getDate() - 7));
            } else {
                return orderDate >= new Date(now.setDate(now.getDate() - 1));
            }
        });

        // Calculate cancellation rates
        const totalOrders = filteredOrders.length;
        const cancelledOrders = filteredOrders.filter(order => order.status === "Cancelled");
        const cancellationRate = totalOrders > 0 ? (cancelledOrders.length / totalOrders) * 100 : 0;

        // Group by reason
        const reasonCounts = {};
        cancelledOrders.forEach(order => {
            const reason = order.cancelReason || "Other";
            reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
        });

        const reasonData = Object.entries(reasonCounts).map(([reason, count]) => ({
            name: reason,
            value: count
        }));

        return {
            totalOrders,
            cancelledOrders: cancelledOrders.length,
            cancellationRate,
            reasonData
        };
    };

    const data = processData();
    const COLORS = ['#005F73', '#0A9396', '#94D2BD', '#E9D8A6', '#EE9B00', '#CA6702', '#BB3E03', '#001219', '#9B2226', '#AE2012'];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 rounded shadow border border-gray-200 text-xs">
                    <p className="font-medium">{label}</p>
                    <p className="text-gray-600">Count: {payload[0].value}</p>
                    <p className="text-gray-600">Percentage: {((payload[0].value / data.cancelledOrders) * 100).toFixed(1)}%</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-4">
            {/* Time Range Selector */}
            <div className="flex justify-end">
                <select 
                    value={timeRange} 
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="text-xs border rounded px-2 py-1"
                >
                    <option value="day">Last 24 Hours</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                </select>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
                {/* Cancellation Reasons Pie Chart */}
                <div className="lg:col-span-7 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                    <h4 className="text-xs font-medium text-gray-700 mb-2">Cancellation Reasons</h4>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.reasonData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={({ name, percent }) => {
                                        // Truncate long names and show percentage
                                        const truncatedName = name.length > 20 ? name.substring(0, 17) + '...' : name;
                                        return `${truncatedName} (${(percent * 100).toFixed(0)}%)`;
                                    }}
                                    labelLine={{ strokeWidth: 0.5 }}
                                >
                                    {data.reasonData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-white p-2 rounded shadow border border-gray-200 text-[10px]">
                                                    <p className="font-medium">{label}</p>
                                                    <p className="text-gray-600">Count: {payload[0].value}</p>
                                                    <p className="text-gray-600">Percentage: {((payload[0].value / data.cancelledOrders) * 100).toFixed(1)}%</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Stats below chart */}
                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="grid grid-cols-3 gap-2 text-[10px]">
                            <div>
                                <span className="text-gray-500">Cancellation Rate</span>
                                <p className="font-semibold text-red-600">{data.cancellationRate.toFixed(1)}%</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Total Cancellations</span>
                                <p className="font-semibold text-red-600">{data.cancelledOrders}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Total Orders</span>
                                <p className="font-semibold text-gray-800">{data.totalOrders}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Reasons List */}
                <div className="lg:col-span-3 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                    <h4 className="text-xs font-medium text-gray-700 mb-2">Top Cancellation Reasons</h4>
                    <div className="space-y-1.5">
                        {data.reasonData
                            .sort((a, b) => b.value - a.value)
                            .slice(0, 5)
                            .map((reason, index) => (
                                <div key={index} className="flex items-center justify-between text-[10px]">
                                    <span className="text-gray-600 truncate">{reason.name}</span>
                                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                        <span className="font-medium text-gray-800">{reason.value}</span>
                                        <span className="text-gray-500">
                                            ({((reason.value / data.cancelledOrders) * 100).toFixed(1)}%)
                                        </span>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CancellationRateChart;