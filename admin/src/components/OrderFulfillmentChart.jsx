import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { FaTruck, FaCheckCircle, FaClock } from 'react-icons/fa';

const OrderFulfillmentChart = () => {
    const [orders, setOrders] = useState([]);
    const [timeRange, setTimeRange] = useState('month');
    const token = localStorage.getItem('token');

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

        // Group orders by time period
        const groupedData = {};
        filteredOrders.forEach(order => {
            const date = new Date(order.date);
            let key;
            if (timeRange === 'month') {
                key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            } else if (timeRange === 'week') {
                key = `Day ${Math.floor((now - date) / (1000 * 60 * 60 * 24))}`;
            } else {
                key = date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
            }
            
            if (!groupedData[key]) {
                groupedData[key] = {
                    processing: 0,
                    shipping: 0,
                    delivery: 0
                };
            }

            if (order.status === 'Pending') {
                groupedData[key].processing++;
            } else if (order.status === 'Shipped') {
                groupedData[key].shipping++;
            } else if (order.status === 'Delivered') {
                groupedData[key].delivery++;
            }
        });

        // Calculate efficiency metrics
        const totalOrders = filteredOrders.length;
        const deliveredOrders = filteredOrders.filter(order => order.status === 'Delivered').length;
        const shippedOrders = filteredOrders.filter(order => order.status === 'Shipped').length;
        const pendingOrders = filteredOrders.filter(order => order.status === 'Pending').length;

        // Calculate average times
        const deliveredOrdersWithTime = filteredOrders.filter(order => 
            order.status === 'Delivered' && 
            order.estimatedDelivery && 
            order.date
        );

        const totalDeliveryTime = deliveredOrdersWithTime.reduce((acc, order) => {
            const deliveryTime = (new Date(order.estimatedDelivery) - new Date(order.date)) / (1000 * 60 * 60); // in hours
            return acc + deliveryTime;
        }, 0);

        const averageDeliveryTime = deliveredOrdersWithTime.length > 0 
            ? totalDeliveryTime / deliveredOrdersWithTime.length 
            : 0;

        return {
            chartData: Object.entries(groupedData).map(([date, data]) => ({
                date,
                ...data
            })),
            metrics: {
                totalOrders,
                deliveredOrders,
                shippedOrders,
                pendingOrders,
                averageDeliveryTime,
                deliveryRate: (deliveredOrders / totalOrders) * 100,
                shippingRate: (shippedOrders / totalOrders) * 100,
                processingRate: (pendingOrders / totalOrders) * 100
            }
        };
    };

    const data = processData();

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 rounded shadow border border-gray-200 text-xs">
                    <p className="font-medium">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-gray-600" style={{ color: entry.color }}>
                            {entry.name}: {entry.value}
                        </p>
                    ))}
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

            {/* Charts and Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
                {/* Fulfillment Timeline Chart */}
                <div className="lg:col-span-7 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                    <h4 className="text-xs font-medium text-gray-700 mb-2">Fulfillment Timeline</h4>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis 
                                    dataKey="date" 
                                    tick={{ fontSize: 10 }}
                                    stroke="#94a3b8"
                                />
                                <YAxis 
                                    tick={{ fontSize: 10 }}
                                    stroke="#94a3b8"
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Line 
                                    type="monotone" 
                                    dataKey="processing" 
                                    name="Processing"
                                    stroke="#3B82F6" 
                                    strokeWidth={2}
                                    dot={{ r: 2 }}
                                    activeDot={{ r: 4 }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="shipping" 
                                    name="Shipping"
                                    stroke="#22C55E" 
                                    strokeWidth={2}
                                    dot={{ r: 2 }}
                                    activeDot={{ r: 4 }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="delivery" 
                                    name="Delivery"
                                    stroke="#F59E0B" 
                                    strokeWidth={2}
                                    dot={{ r: 2 }}
                                    activeDot={{ r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Efficiency Metrics */}
                <div className="lg:col-span-3 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                    <h4 className="text-xs font-medium text-gray-700 mb-2">Stage Efficiency</h4>
                    <div className="space-y-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-1">
                                    <FaClock className="text-blue-500" />
                                    <span className="text-[10px] text-gray-600">Processing</span>
                                </div>
                                <span className="text-[10px] font-medium text-blue-600">
                                    {data.metrics.processingRate.toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" 
                                    style={{ width: `${data.metrics.processingRate}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="p-2 bg-green-50 rounded-lg">
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-1">
                                    <FaTruck className="text-green-500" />
                                    <span className="text-[10px] text-gray-600">Shipping</span>
                                </div>
                                <span className="text-[10px] font-medium text-green-600">
                                    {data.metrics.shippingRate.toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                    className="bg-green-500 h-1.5 rounded-full transition-all duration-500" 
                                    style={{ width: `${data.metrics.shippingRate}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="p-2 bg-orange-50 rounded-lg">
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-1">
                                    <FaCheckCircle className="text-orange-500" />
                                    <span className="text-[10px] text-gray-600">Delivery</span>
                                </div>
                                <span className="text-[10px] font-medium text-orange-600">
                                    {data.metrics.deliveryRate.toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                    className="bg-orange-500 h-1.5 rounded-full transition-all duration-500" 
                                    style={{ width: `${data.metrics.deliveryRate}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-gray-100">
                            <div className="flex items-center justify-between text-[10px]">
                                <span className="text-gray-600">Avg. Delivery Time</span>
                                <span className="font-medium text-gray-800">
                                    {data.metrics.averageDeliveryTime.toFixed(1)}h
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Report Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mt-4">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-medium text-gray-700">Fulfillment Performance Report</h4>
                    <span className="text-[10px] text-gray-500">
                        {timeRange === 'day' ? 'Last 24 Hours' : 
                         timeRange === 'week' ? 'Last 7 Days' : 'Last 30 Days'}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Key Performance Indicators */}
                    <div className="space-y-2">
                        <h5 className="text-[10px] font-medium text-gray-600">Key Performance Indicators</h5>
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-gray-500">Total Orders</span>
                                <span className="font-medium text-gray-800">{data.metrics.totalOrders}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-gray-500">Success Rate</span>
                                <span className="font-medium text-green-600">
                                    {((data.metrics.deliveredOrders / data.metrics.totalOrders) * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-gray-500">Avg. Processing Time</span>
                                <span className="font-medium text-gray-800">
                                    {(data.metrics.averageDeliveryTime * 0.3).toFixed(1)}h
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stage Distribution */}
                    <div className="space-y-2">
                        <h5 className="text-[10px] font-medium text-gray-600">Stage Distribution</h5>
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-gray-500">Processing</span>
                                <span className="font-medium text-blue-600">{data.metrics.pendingOrders}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-gray-500">Shipping</span>
                                <span className="font-medium text-green-600">{data.metrics.shippedOrders}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-gray-500">Delivered</span>
                                <span className="font-medium text-orange-600">{data.metrics.deliveredOrders}</span>
                            </div>
                        </div>
                    </div>

                    {/* Efficiency Metrics */}
                    <div className="space-y-2">
                        <h5 className="text-[10px] font-medium text-gray-600">Efficiency Metrics</h5>
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-gray-500">Processing Rate</span>
                                <span className="font-medium text-blue-600">
                                    {data.metrics.processingRate.toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-gray-500">Shipping Rate</span>
                                <span className="font-medium text-green-600">
                                    {data.metrics.shippingRate.toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-gray-500">Delivery Rate</span>
                                <span className="font-medium text-orange-600">
                                    {data.metrics.deliveryRate.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Time Analysis */}
                    <div className="space-y-2">
                        <h5 className="text-[10px] font-medium text-gray-600">Time Analysis</h5>
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-gray-500">Avg. Delivery Time</span>
                                <span className="font-medium text-gray-800">
                                    {data.metrics.averageDeliveryTime.toFixed(1)}h
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-gray-500">Processing Time</span>
                                <span className="font-medium text-gray-800">
                                    {(data.metrics.averageDeliveryTime * 0.3).toFixed(1)}h
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-gray-500">Shipping Time</span>
                                <span className="font-medium text-gray-800">
                                    {(data.metrics.averageDeliveryTime * 0.7).toFixed(1)}h
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Insights */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <h5 className="text-[10px] font-medium text-gray-600 mb-2">Performance Insights</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-2 rounded-lg">
                            <p className="text-[10px] text-gray-600">
                                <span className="font-medium text-blue-600">Processing Efficiency: </span>
                                {data.metrics.processingRate > 70 ? 'High' : 
                                 data.metrics.processingRate > 40 ? 'Medium' : 'Low'}
                            </p>
                        </div>
                        <div className="bg-green-50 p-2 rounded-lg">
                            <p className="text-[10px] text-gray-600">
                                <span className="font-medium text-green-600">Shipping Performance: </span>
                                {data.metrics.shippingRate > 70 ? 'Excellent' : 
                                 data.metrics.shippingRate > 40 ? 'Good' : 'Needs Improvement'}
                            </p>
                        </div>
                        <div className="bg-orange-50 p-2 rounded-lg">
                            <p className="text-[10px] text-gray-600">
                                <span className="font-medium text-orange-600">Delivery Success: </span>
                                {data.metrics.deliveryRate > 70 ? 'High' : 
                                 data.metrics.deliveryRate > 40 ? 'Moderate' : 'Low'}
                            </p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg">
                            <p className="text-[10px] text-gray-600">
                                <span className="font-medium text-gray-600">Overall Performance: </span>
                                {((data.metrics.processingRate + data.metrics.shippingRate + data.metrics.deliveryRate) / 3) > 70 ? 'Excellent' : 
                                 ((data.metrics.processingRate + data.metrics.shippingRate + data.metrics.deliveryRate) / 3) > 40 ? 'Good' : 'Needs Attention'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderFulfillmentChart;