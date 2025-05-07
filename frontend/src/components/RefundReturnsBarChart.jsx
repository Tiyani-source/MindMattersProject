import React, { useContext, useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";
import { AppContext } from "../context/AppContext";
import { FaShoppingCart, FaTruck, FaChartLine, FaMoneyBillWave } from "react-icons/fa";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SpendingSummaryReport = () => {
    const { orders, studentData, fetchOrders } = useContext(AppContext);
    const [chartData, setChartData] = useState(null);
    const [summaryData, setSummaryData] = useState(null);

    useEffect(() => {
        if (studentData?._id) {
            fetchOrders(studentData._id);
        }
    }, [studentData]);

    useEffect(() => {
        if (orders.length > 0) {
            // Group orders by date and calculate totals
            const groupedOrders = orders.reduce((acc, order) => {
                const date = new Date(order.date).toLocaleDateString();
                if (!acc[date]) {
                    acc[date] = {
                        productTotal: 0,
                        shippingCost: 0,
                        totalAmount: 0,
                        orderCount: 0
                    };
                }
                acc[date].productTotal += (order.totalAmount - order.shippingCost);
                acc[date].shippingCost += order.shippingCost;
                acc[date].totalAmount += order.totalAmount;
                acc[date].orderCount += 1;
                return acc;
            }, {});

            // Sort dates in ascending order
            const sortedDates = Object.keys(groupedOrders).sort((a, b) => new Date(a) - new Date(b));

            // Calculate summary statistics
            const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
            const totalShipping = orders.reduce((sum, order) => sum + order.shippingCost, 0);
            const totalProducts = orders.reduce((sum, order) => sum + (order.totalAmount - order.shippingCost), 0);
            const averageOrderValue = totalSpent / orders.length;
            const mostRecentOrder = orders[orders.length - 1];

            setSummaryData({
                totalSpent,
                totalShipping,
                totalProducts,
                averageOrderValue,
                totalOrders: orders.length,
                mostRecentOrder
            });

            const data = {
                labels: sortedDates,
                datasets: [
                    {
                        label: "Product Total",
                        data: sortedDates.map(date => groupedOrders[date].productTotal),
                        backgroundColor: "#4CAF50",
                        hoverBackgroundColor: "#388E3C",
                        borderRadius: 6,
                    },
                    {
                        label: "Shipping Cost",
                        data: sortedDates.map(date => groupedOrders[date].shippingCost),
                        backgroundColor: "#2196F3",
                        hoverBackgroundColor: "#1976D2",
                        borderRadius: 6,
                    },
                ],
            };

            setChartData(data);
        }
    }, [orders]);

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: "Daily Spending Summary",
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.dataset.label || '';
                        const value = context.raw;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: LKR ${value.toFixed(2)} (${percentage}%)`;
                    }
                }
            }
        },
        scales: {
            x: {
                stacked: true,
                title: {
                    display: true,
                    text: "Date",
                },
            },
            y: {
                stacked: true,
                title: {
                    display: true,
                    text: "Total Amount (LKR)",
                },
                beginAtZero: true,
            },
        },
    };

    if (!chartData || !summaryData) {
        return (
            <div className="p-6 bg-white shadow-lg rounded-lg flex justify-center items-center w-full max-w-[1200px] h-[500px] mx-auto">
                <p className="text-gray-500">Loading spending data...</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white shadow-lg rounded-lg flex justify-between items-center w-full max-w-[1200px] h-[500px] mx-auto">
            {/* Chart Section */}
            <div className="w-[60%] h-full">
                <h3 className="text-lg font-semibold mb-4 text-center">Daily Spending Overview</h3>
                <div className="w-full h-[400px]">
                    <Bar data={chartData} options={options} />
                </div>
            </div>

            {/* Summary Section */}
            <div className="w-[35%] h-full flex flex-col justify-center space-y-6">
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 text-purple-800">Your Spending Snapshot</h3>
                    
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="bg-purple-100 p-2 rounded-full">
                                <FaMoneyBillWave className="text-purple-600 text-xl" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Spent</p>
                                <p className="text-lg font-semibold text-purple-800">LKR {summaryData.totalSpent.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="bg-green-100 p-2 rounded-full">
                                <FaShoppingCart className="text-green-600 text-xl" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Product Value</p>
                                <p className="text-lg font-semibold text-green-800">LKR {summaryData.totalProducts.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                                <FaTruck className="text-blue-600 text-xl" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Shipping Costs</p>
                                <p className="text-lg font-semibold text-blue-800">LKR {summaryData.totalShipping.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="bg-amber-100 p-2 rounded-full">
                                <FaChartLine className="text-amber-600 text-xl" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Average Order Value</p>
                                <p className="text-lg font-semibold text-amber-800">LKR {summaryData.averageOrderValue.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold">{summaryData.totalOrders}</span> orders placed
                        </p>
                        {summaryData.mostRecentOrder && (
                            <p className="text-sm text-gray-600 mt-1">
                                Latest order: <span className="font-semibold">LKR {summaryData.mostRecentOrder.totalAmount.toFixed(2)}</span>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpendingSummaryReport;