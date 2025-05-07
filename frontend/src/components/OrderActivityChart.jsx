import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
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
    const [deliveryStatusData, setDeliveryStatusData] = useState({ labels: [], data: [] });
    const [deliveryStats, setDeliveryStats] = useState({
        totalOrders: 0,
        completedDeliveries: 0,
        averageDeliveryTime: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const {
        userData,
        orders = [],
        fetchOrders,
        fetchDeliveryPartners
    } = useContext(AppContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                if (userData?._id) {
                    await Promise.all([
                        fetchOrders(userData._id),
                        fetchDeliveryPartners()
                    ]);
                }
            } catch (err) {
                setError("Failed to fetch data. Please try again later.");
                console.error("Error fetching data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [userData, fetchOrders, fetchDeliveryPartners]);

    useEffect(() => {
        try {
            // Process delivery status data
            const statusCount = orders.reduce((acc, order) => {
                if (order?.deliveryStatus) {
                    acc[order.deliveryStatus] = (acc[order.deliveryStatus] || 0) + 1;
                }
                return acc;
            }, {});

            setDeliveryStatusData({
                labels: Object.keys(statusCount),
                data: Object.values(statusCount)
            });

            // Calculate delivery stats
            const completedOrders = orders.filter(order => 
                order?.deliveryStatus === 'Delivered' && 
                order?.estimatedDelivery && 
                order?.date
            );

            const totalDeliveryTime = completedOrders.reduce((acc, order) => {
                try {
                    const deliveryTime = (new Date(order.estimatedDelivery) - new Date(order.date)) / (1000 * 60 * 60);
                    return acc + deliveryTime;
                } catch (err) {
                    console.error("Error calculating delivery time:", err);
                    return acc;
                }
            }, 0);

            setDeliveryStats({
                totalOrders: orders.length,
                completedDeliveries: completedOrders.length,
                averageDeliveryTime: completedOrders.length > 0 ? totalDeliveryTime / completedOrders.length : 0
            });
        } catch (err) {
            console.error("Error processing data:", err);
            setError("Error processing data. Please try again later.");
        }
    }, [orders]);

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

    if (isLoading) {
        return (
            <div className="p-6 bg-white shadow-lg rounded-lg flex items-center justify-center h-[500px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading delivery data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-white shadow-lg rounded-lg flex items-center justify-center h-[500px]">
                <div className="text-center text-red-500">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

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