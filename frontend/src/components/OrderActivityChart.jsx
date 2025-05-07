import React from "react";
import { Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from "chart.js";
import { FaTruck, FaCheckCircle, FaClock } from "react-icons/fa";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const OrderActivityChart = () => {
    // Sample data
    const sampleOrders = [
        { deliveryStatus: 'Delivered', date: '2024-03-01', estimatedDelivery: '2024-03-02' },
        { deliveryStatus: 'In Transit', date: '2024-03-02', estimatedDelivery: '2024-03-03' },
        { deliveryStatus: 'Processing', date: '2024-03-03', estimatedDelivery: '2024-03-04' },
        { deliveryStatus: 'Delivered', date: '2024-03-04', estimatedDelivery: '2024-03-05' },
        { deliveryStatus: 'Delivered', date: '2024-03-05', estimatedDelivery: '2024-03-06' },
        { deliveryStatus: 'In Transit', date: '2024-03-06', estimatedDelivery: '2024-03-07' },
        { deliveryStatus: 'Processing', date: '2024-03-07', estimatedDelivery: '2024-03-08' },
        { deliveryStatus: 'Delivered', date: '2024-03-08', estimatedDelivery: '2024-03-09' },
    ];

    // Process delivery status data
    const statusCount = sampleOrders.reduce((acc, order) => {
        if (order?.deliveryStatus) {
            acc[order.deliveryStatus] = (acc[order.deliveryStatus] || 0) + 1;
        }
        return acc;
    }, {});

    const deliveryStatusData = {
        labels: Object.keys(statusCount),
        data: Object.values(statusCount)
    };

    // Calculate delivery stats
    const completedOrders = sampleOrders.filter(order => 
        order?.deliveryStatus === 'Delivered' && 
        order?.estimatedDelivery && 
        order?.date
    );

    const totalDeliveryTime = completedOrders.reduce((acc, order) => {
        const deliveryTime = (new Date(order.estimatedDelivery) - new Date(order.date)) / (1000 * 60 * 60);
        return acc + deliveryTime;
    }, 0);

    const deliveryStats = {
        totalOrders: sampleOrders.length,
        completedDeliveries: completedOrders.length,
        averageDeliveryTime: completedOrders.length > 0 ? totalDeliveryTime / completedOrders.length : 0
    };

    const deliveryStatusChart = {
        labels: deliveryStatusData.labels,
        datasets: [
            {
                data: deliveryStatusData.data,
                backgroundColor: ["#FF6F61", "#4ECDC4", "#45B7D1"],
                hoverBackgroundColor: ["#E45B50", "#3DBBB3", "#3CA5BC"],
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        }
    };

    return (
        <div className="p-6 bg-white shadow-lg rounded-lg">
            <h3 className="text-lg font-semibold mb-6 text-center">Delivery Activity Overview</h3>
            
            <div className="flex flex-col md:flex-row gap-6">
                {/* Delivery Status Chart */}
                <div className="bg-gray-50 p-4 rounded-lg flex-1">
                    <h4 className="text-sm font-medium mb-4 text-center">Delivery Status Distribution</h4>
                    <div className="h-[300px]">
                        <Pie data={deliveryStatusChart} options={chartOptions} />
                    </div>
                </div>

                {/* Delivery Stats */}
                <div className="flex-1 space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Orders</p>
                                <p className="text-2xl font-semibold text-blue-800">{deliveryStats.totalOrders}</p>
                            </div>
                            <FaTruck className="text-blue-500 text-xl" />
                        </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Completed Deliveries</p>
                                <p className="text-2xl font-semibold text-green-800">{deliveryStats.completedDeliveries}</p>
                            </div>
                            <FaCheckCircle className="text-green-500 text-xl" />
                        </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Avg. Delivery Time</p>
                                <p className="text-2xl font-semibold text-yellow-800">
                                    {deliveryStats.averageDeliveryTime.toFixed(1)} hrs
                                </p>
                            </div>
                            <FaClock className="text-yellow-500 text-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderActivityChart;