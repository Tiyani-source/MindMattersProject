import React, { useState } from "react";
import OrderStatusCard from "../components/OrderStatusCard";
import OrderActivityChart from "../components/OrderActivityChart";
import OrderStatusPieChart from "../components/OrderStatusPieChart";
import SpendingSummaryReport from "../components/RefundReturnsBarChart";
import { FaChartPie, FaChartLine, FaMoneyBillWave, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const OrderAnalytics = () => {
    const [selectedChart, setSelectedChart] = useState("Order Status");
    const navigate = useNavigate();

    // Function to render the correct chart
    const renderChart = () => {
        switch (selectedChart) {
            case "Order Status":
                return <OrderStatusPieChart />;
            case "Order Activity":
                return <OrderActivityChart />;
            case "Spending Summary":
                return <SpendingSummaryReport />;
            default:
                return <p className="text-gray-500">Select a chart to view.</p>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate("/my-orders")}
                    className="mb-6 flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                    <div className="p-2 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors duration-200">
                        <FaArrowLeft className="text-lg" />
                    </div>
                    <span className="font-medium">Back to Orders</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left Column - Header and Navigation */}
                    <div className="lg:col-span-1">
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-800">Order Analytics Dashboard</h1>
                            <p className="text-gray-600">Track and analyze your order performance</p>
                        </div>

                        {/* Navigation Cards */}
                        <div className="space-y-4">
                            <div 
                                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                                    selectedChart === "Order Status" 
                                    ? "bg-blue-50 border-l-4 border-blue-500" 
                                    : "bg-white hover:bg-gray-50"
                                }`}
                                onClick={() => setSelectedChart("Order Status")}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 rounded-full">
                                        <FaChartPie className="text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-800">Order Status</h3>
                                        <p className="text-sm text-gray-600">View order distribution</p>
                                    </div>
                                </div>
                            </div>

                            <div 
                                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                                    selectedChart === "Order Activity" 
                                    ? "bg-green-50 border-l-4 border-green-500" 
                                    : "bg-white hover:bg-gray-50"
                                }`}
                                onClick={() => setSelectedChart("Order Activity")}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-green-100 rounded-full">
                                        <FaChartLine className="text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-800">Delivery Activity</h3>
                                        <p className="text-sm text-gray-600">Track delivery status and performance</p>
                                    </div>
                                </div>
                            </div>

                            <div 
                                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                                    selectedChart === "Spending Summary" 
                                    ? "bg-purple-50 border-l-4 border-purple-500" 
                                    : "bg-white hover:bg-gray-50"
                                }`}
                                onClick={() => setSelectedChart("Spending Summary")}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-purple-100 rounded-full">
                                        <FaMoneyBillWave className="text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-800">Spending Summary</h3>
                                        <p className="text-sm text-gray-600">Analyze spending patterns</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Chart Section */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg shadow-sm p-4 h-full">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">{selectedChart}</h2>
                                <div className="text-sm text-gray-500">
                                    {new Date().toLocaleDateString()}
                                </div>
                            </div>
                            <div className="h-[500px]">
                                {renderChart()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderAnalytics;




