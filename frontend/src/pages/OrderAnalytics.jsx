import React, { useState } from "react";
import OrderStatusCard from "../components/OrderStatusCard";
import OrderActivityChart from "../components/OrderActivityChart";
import OrderStatusPieChart from "../components/OrderStatusPieChart";
import RefundReturnsBarChart from "../components/RefundReturnsBarChart";

const OrderAnalytics = () => {
    const [selectedChart, setSelectedChart] = useState("Order Status");

    // ✅ Function to render the correct chart
    const renderChart = () => {
        switch (selectedChart) {
            case "Order Status":
                return <OrderStatusPieChart />;
            case "Order Activity":
                return <OrderActivityChart />;
            case "Refunds: Requested vs. Approved":
                return <RefundReturnsBarChart />;
            default:
                return <p className="text-gray-500">Select a chart to view.</p>;
        }
    };

    return (
        <div className="flex min-h-screen p-4">  {/* Make it a flex container */}
            
            {/*  Sidebar with Order Status Cards */}
            <div className="w-[350px] flex flex-col gap-20">
                <OrderStatusCard 
                    title="Order Status Breakdown"
                    count={null} 
                    description="View how many orders are completed, pending, or cancelled."
                    bgColor="bg-green-50"
                    icon="📊"
                    onClick={() => setSelectedChart("Order Status")}
                />
                 <OrderStatusCard 
                    title="Order Activity Trends"
                    count={null} 
                    description="Track your order history and trends over time."
                    bgColor="bg-blue-50"
                    icon="📆"
                    onClick={() => setSelectedChart("Order Activity")}
                />
                <OrderStatusCard 
                    title="Refunds: Requested vs. Approved"
                    count={null} 
                    description="Use this section to check which refund requests have been approved and successfully processed."
                    bgColor="bg-red-50"
                    icon="🔄"
                    onClick={() => setSelectedChart("Refunds: Requested vs. Approved")}
                />
            </div>

            {/*  Main Content (Charts) */}
            

            <div className="flex-1 bg-white shadow-lg rounded-lg p-6 mx-auto h-[90vh] overflow-auto">
            <h3 className="text-lg font-semibold text-zinc-800 text-left w-full">{selectedChart}</h3>
                
                <div className="p-6 bg-gray-50 shadow-md rounded-lg flex justify-center items-center">
                    
                    <div className="w-[90%] max-w-[900px] h-[600px] flex justify-center items-center">{renderChart()}</div>
                </div>
            </div>
        </div>
    );
};

export default OrderAnalytics;




