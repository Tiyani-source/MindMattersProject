import React, { useState, useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables);

const OrderVolumeChart = () => {
    const [timeRange, setTimeRange] = useState('month');
    const [selectedMetric, setSelectedMetric] = useState('all');
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    // Sample data - replace with actual data from your backend
    const monthlyData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Total Orders',
                data: [120, 145, 160, 180, 200, 220],
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            },
            {
                label: 'Completed Orders',
                data: [110, 130, 150, 170, 190, 210],
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            },
            {
                label: 'Pending Orders',
                data: [10, 15, 10, 10, 10, 10],
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                borderColor: 'rgba(245, 158, 11, 1)',
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
                label: 'Total Orders',
                data: [45, 50, 55, 60],
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            },
            {
                label: 'Completed Orders',
                data: [40, 45, 50, 55],
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            },
            {
                label: 'Pending Orders',
                data: [5, 5, 5, 5],
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                borderColor: 'rgba(245, 158, 11, 1)',
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
                label: 'Total Orders',
                data: [15, 20, 25, 30, 35, 40, 45],
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            },
            {
                label: 'Completed Orders',
                data: [14, 18, 23, 28, 33, 38, 43],
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            },
            {
                label: 'Pending Orders',
                data: [1, 2, 2, 2, 2, 2, 2],
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                borderColor: 'rgba(245, 158, 11, 1)',
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

        // Map button label to dataset label for filtering
        const metricMap = {
            all: null,
            completed: 'Completed Orders',
            pending: 'Pending Orders',
        };
        const filterLabel = metricMap[selectedMetric];

        const ctx = chartRef.current.getContext('2d');
        chartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: data.datasets.map(dataset => ({
                    ...dataset,
                    hidden: filterLabel ? dataset.label !== filterLabel : false
                }))
            },
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
                                return `${context.dataset.label}: ${context.parsed.y} orders`;
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
    }, [timeRange, data, selectedMetric]);

    const getGrowthRate = () => {
        const currentData = data.datasets[0].data;
        const lastPeriod = currentData[currentData.length - 1];
        const previousPeriod = currentData[currentData.length - 2];
        return ((lastPeriod - previousPeriod) / previousPeriod * 100).toFixed(1);
    };

    const getAverageOrders = () => {
        const currentData = data.datasets[0].data;
        return (currentData.reduce((a, b) => a + b, 0) / currentData.length).toFixed(0);
    };

    return (
        <div className="w-full max-w-flex mx-auto ">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
                    <div>
                    </div>
                    <div className="flex gap-2 mt-2 md:mt-0">
                        <button
                            onClick={() => setTimeRange('day')}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                                timeRange === 'day'
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Daily
                        </button>
                        <button
                            onClick={() => setTimeRange('week')}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                                timeRange === 'week'
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Weekly
                        </button>
                        <button
                            onClick={() => setTimeRange('month')}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                                timeRange === 'month'
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Monthly
                        </button>
                    </div>
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-indigo-50 rounded-lg p-4 flex flex-col items-center justify-center">
                        <span className="text-xs text-gray-500">Total Orders</span>
                        <span className="text-2xl font-bold text-indigo-600">
                            {data.datasets[0].data[data.datasets[0].data.length - 1]}
                        </span>
                        <span className={`text-xs mt-1 ${getGrowthRate() >= 0 ? 'text-green-600' : 'text-red-600'}`}>{getGrowthRate() >= 0 ? '↑' : '↓'} {Math.abs(getGrowthRate())}%</span>
                        <span className="text-[11px] text-gray-400">from last period</span>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 flex flex-col items-center justify-center">
                        <span className="text-xs text-gray-500">Average Orders</span>
                        <span className="text-2xl font-bold text-green-600">{getAverageOrders()}</span>
                        <span className="text-[11px] text-gray-400 mt-1">per {timeRange}</span>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 flex flex-col items-center justify-center">
                        <span className="text-xs text-gray-500">Completion Rate</span>
                        <span className="text-2xl font-bold text-blue-600">94.5%</span>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '94.5%' }}></div>
                        </div>
                    </div>
                </div>

                {/* Chart Card */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                        <button
                            onClick={() => setSelectedMetric('all')}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                                selectedMetric === 'all'
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            All Orders
                        </button>
                        <button
                            onClick={() => setSelectedMetric('completed')}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                                selectedMetric === 'completed'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Completed
                        </button>
                        <button
                            onClick={() => setSelectedMetric('pending')}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                                selectedMetric === 'pending'
                                    ? 'bg-yellow-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Pending
                        </button>
                    </div>
                    <div style={{ height: '350px', position: 'relative' }}>
                        <canvas ref={chartRef}></canvas>
                    </div>
                </div>

                {/* Insights Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex flex-col justify-between h-full">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Peak Order Times</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Most Active Day</span>
                                <span className="text-sm font-semibold text-indigo-600">Saturday</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Peak Hour</span>
                                <span className="text-sm font-semibold text-indigo-600">2:00 PM - 4:00 PM</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex flex-col justify-between h-full">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Order Distribution</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Weekday Orders</span>
                                <span className="text-sm font-semibold text-indigo-600">65%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Weekend Orders</span>
                                <span className="text-sm font-semibold text-indigo-600">35%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderVolumeChart;