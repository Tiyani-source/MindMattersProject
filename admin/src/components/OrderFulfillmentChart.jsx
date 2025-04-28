import React, { useState, useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables);

const OrderFulfillmentChart = () => {
    const [timeRange, setTimeRange] = useState('month');
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    // Sample data - replace with actual data from your backend
    const monthlyData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Processing',
                data: [1.2, 1.0, 0.9, 1.1, 0.8, 0.7],
                backgroundColor: 'rgba(78, 205, 196, 0.3)',
                borderColor: 'rgba(78, 205, 196, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            },
            {
                label: 'Shipping',
                data: [0.8, 0.7, 0.6, 0.7, 0.5, 0.4],
                backgroundColor: 'rgba(69, 183, 209, 0.3)',
                borderColor: 'rgba(69, 183, 209, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            },
            {
                label: 'Delivery',
                data: [1.0, 0.9, 0.8, 0.9, 0.7, 0.6],
                backgroundColor: 'rgba(150, 206, 180, 0.3)',
                borderColor: 'rgba(150, 206, 180, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }
        ]
    };

    const weeklyData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
            {
                label: 'Processing',
                data: [1.1, 0.9, 0.8, 0.7],
                backgroundColor: 'rgba(78, 205, 196, 0.3)',
                borderColor: 'rgba(78, 205, 196, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            },
            {
                label: 'Shipping',
                data: [0.7, 0.6, 0.5, 0.4],
                backgroundColor: 'rgba(69, 183, 209, 0.3)',
                borderColor: 'rgba(69, 183, 209, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            },
            {
                label: 'Delivery',
                data: [0.9, 0.8, 0.7, 0.6],
                backgroundColor: 'rgba(150, 206, 180, 0.3)',
                borderColor: 'rgba(150, 206, 180, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }
        ]
    };

    const dailyData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Processing',
                data: [0.8, 0.7, 0.6, 0.7, 0.8, 0.9, 0.7],
                backgroundColor: 'rgba(78, 205, 196, 0.3)',
                borderColor: 'rgba(78, 205, 196, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            },
            {
                label: 'Shipping',
                data: [0.5, 0.4, 0.3, 0.4, 0.5, 0.6, 0.4],
                backgroundColor: 'rgba(69, 183, 209, 0.3)',
                borderColor: 'rgba(69, 183, 209, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            },
            {
                label: 'Delivery',
                data: [0.7, 0.6, 0.5, 0.6, 0.7, 0.8, 0.6],
                backgroundColor: 'rgba(150, 206, 180, 0.3)',
                borderColor: 'rgba(150, 206, 180, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }
        ]
    };

    const data = timeRange === 'month' ? monthlyData : timeRange === 'week' ? weeklyData : dailyData;

    useEffect(() => {
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        chartInstance.current = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#1f2937',
                        bodyColor: '#4b5563',
                        borderColor: '#e5e7eb',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true,
                        boxPadding: 6,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y} days`;
                            }
                        }
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(243, 244, 246, 1)'
                        },
                        ticks: {
                            color: '#6b7280'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6b7280'
                        }
                    }
                }
            }
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [timeRange, data]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800"></h3>
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
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Fulfillment Timeline</h4>
                    <div style={{ height: '300px', position: 'relative' }}>
                        <canvas ref={chartRef}></canvas>
                    </div>
                </div>

                {/* Stage Efficiency Chart */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Stage Efficiency</h4>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700">Processing</span>
                                <span className="text-sm font-semibold text-blue-600">92%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                            </div>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700">Shipping</span>
                                <span className="text-sm font-semibold text-green-600">88%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                            </div>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700">Delivery</span>
                                <span className="text-sm font-semibold text-purple-600">95%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700">Average Processing Time</h4>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                        {data.datasets[0].data.reduce((a, b) => a + b, 0) / data.datasets[0].data.length} days
                    </p>
                    <p className="text-xs text-gray-500 mt-1">↓ 0.3 days from last period</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700">Average Shipping Time</h4>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                        {data.datasets[1].data.reduce((a, b) => a + b, 0) / data.datasets[1].data.length} days
                    </p>
                    <p className="text-xs text-gray-500 mt-1">↓ 0.2 days from last period</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700">Average Delivery Time</h4>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                        {data.datasets[2].data.reduce((a, b) => a + b, 0) / data.datasets[2].data.length} days
                    </p>
                    <p className="text-xs text-gray-500 mt-1">↓ 0.4 days from last period</p>
                </div>
            </div>
        </div>
    );
};

export default OrderFulfillmentChart;