import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from "chart.js";
import { FaCheckCircle, FaClock, FaTruck, FaTimesCircle } from "react-icons/fa";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const processData = (orders) => {
    const labels = [];
    const freq = {};

    orders.forEach(order => {
        labels.push(order.status)
        if (freq[order.status]) {
            freq[order.status]++;
        } else {
            freq[order.status] = 1;
        }
    });

    let uniqueLabels = Array.from(new Set(labels))
    return { labels: uniqueLabels, data: Object.values(freq) }
}

const getStatusIcon = (status) => {
    switch (status) {
        case "Delivered":
            return <FaCheckCircle className="text-green-500" />;
        case "Pending":
            return <FaClock className="text-yellow-500" />;
        case "Shipped":
            return <FaTruck className="text-blue-500" />;
        case "Cancelled":
            return <FaTimesCircle className="text-red-500" />;
        default:
            return null;
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case "Delivered":
            return "bg-green-50 text-green-800";
        case "Pending":
            return "bg-yellow-50 text-yellow-800";
        case "Shipped":
            return "bg-blue-50 text-blue-800";
        case "Cancelled":
            return "bg-red-50 text-red-800";
        default:
            return "bg-gray-50 text-gray-800";
    }
};

const OrderStatusPieChart = () => {
    const [labelArray, setLabels] = useState([]);
    const [dataArray, setDatas] = useState([]);
    const [statusSummary, setStatusSummary] = useState({});

    const {
        userData,
        orders,
        fetchOrders,
    } = useContext(AppContext);

    useEffect(() => {
        if (userData?._id) {
            fetchOrders(userData._id);
        }
    }, [userData]);

    useEffect(() => {
        const { labels, data } = processData(orders);
        setLabels(labels);
        setDatas(data);

        // Calculate status summary
        const summary = orders.reduce((acc, order) => {
            if (!acc[order.status]) {
                acc[order.status] = {
                    count: 0,
                    totalAmount: 0,
                    averageAmount: 0
                };
            }
            acc[order.status].count++;
            acc[order.status].totalAmount += order.totalAmount;
            acc[order.status].averageAmount = acc[order.status].totalAmount / acc[order.status].count;
            return acc;
        }, {});

        setStatusSummary(summary);
    }, [orders]);

    const data = {
        labels: labelArray,
        datasets: [
            {
                data: dataArray,
                backgroundColor: ["#0096A5", "#FF6F61", "#F4A261", "#4E4E50"],
                hoverBackgroundColor: ["#007985", "#E45B50", "#E08C50", "#3B3B3D"],
            },
        ],
    };

    const options = {
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
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} orders (${percentage}%)`;
                    }
                }
            }
        }
    };

    return (
        <div className="p-6 bg-white shadow-lg rounded-lg flex justify-between items-center w-full max-w-[1200px] h-[500px] mx-auto">
            {/* Chart Section */}
            <div className="w-[60%] h-full">
                <h3 className="text-lg font-semibold mb-4 text-center">Order Status Distribution</h3>
                <div className="w-full h-[400px]">
                    <Pie data={data} options={options} />
                </div>
            </div>

            {/* Summary Section */}
            <div className="w-[35%] h-full">
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-lg shadow-sm h-full flex flex-col">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Order Status Overview</h3>
                    
                    <div className="space-y-3 overflow-y-auto flex-grow pr-2">
                        {labelArray.map((status, index) => (
                            <div key={status} className={`p-3 rounded-lg ${getStatusColor(status)}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="p-1.5 bg-white rounded-full">
                                            {getStatusIcon(status)}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-sm">{status}</h4>
                                            <p className="text-xs">{dataArray[index]} orders</p>
                                        </div>
                                    </div>
                                    {statusSummary[status] && (
                                        <div className="text-right">
                                            <p className="text-xs">Avg. Value</p>
                                            <p className="font-semibold text-sm">LKR {statusSummary[status].averageAmount.toFixed(2)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-600">Total Orders</p>
                            <p className="font-semibold text-sm text-gray-800">{orders.length}</p>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-gray-600">Completed Orders</p>
                            <p className="font-semibold text-sm text-green-600">
                                {statusSummary["Delivered"]?.count || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderStatusPieChart;