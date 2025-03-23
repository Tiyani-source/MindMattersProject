import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import jsPDF from "jspdf";
import OrderStatusCard from '../components/OrderStatusCard';

const MyOrders = () => {
    const [allOrders, setAllOrders] = useState([]);
    const [filter, setFilter] = useState("All");
    const navigate = useNavigate();

    const userId = "user123"; // Replace with real user ID from auth/session

    // 🔄 Fetch orders from backend
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get(`/api/orders/${userId}`);
                setAllOrders(res.data);
            } catch (error) {
                console.error("Error fetching orders:", error);
            }
        };
        fetchOrders();
    }, [userId]);

    // 🧠 Filter logic
    const filteredOrders = filter === "All" 
        ? allOrders 
        : filter === "PendingOrShipped"
        ? allOrders.filter(order => order.status === "Pending" || order.status === "Shipped")
        : allOrders.filter(order => order.status === filter);

    // 📄 Print invoice
    const handlePrintInvoice = (orderId) => {
        const doc = new jsPDF();
      
        doc.setFontSize(16);
        doc.text("Invoice", 20, 20);
        doc.setFontSize(12);
        doc.text(`Order ID: ${orderId}`, 20, 40);
        doc.text("Thank you for your purchase!", 20, 60);
      
        // Save PDF
        doc.save(`Invoice_${orderId}.pdf`);
      };

    // Cancel order
    const cancelOrder = async (orderId) => {
        try {
            await axios.patch(`/api/orders/${userId}/${orderId}/cancel`);
            setAllOrders(prev => 
                prev.map(order => 
                    order.orderId === orderId ? { ...order, status: "Cancelled" } : order
                )
            );
        } catch (err) {
            console.error("Failed to cancel order:", err);
        }
    };

    return (
        <div>
            <p className="pb-3 mt-18 font-medium text-zinc-900 border-b text-center">My Orders</p>
            <div className="flex justify-between items-center pb-3 mt-12 border-b">
                <button 
                    className="text-sm transparent text-blue px-8 py-2 rounded-lg hover:bg-blue-50 transition-all"
                    onClick={() => navigate('/store')}
                >
                    + Place New Order
                </button>
                <button 
                    className="text-sm transparent text-blue px-8 py-2 rounded-lg hover:bg-blue-50 transition-all"
                    onClick={() => navigate('/order-analytics')}
                >
                    View Analytics
                </button>
                <button 
                    className="text-sm transparent text-blue px-8 py-2 rounded-lg hover:bg-blue-50 transition-all"
                    onClick={() => navigate('/order-management')}
                >
                    Admin
                </button>
            </div>

            {/* 🔹 Order Status Cards Section */}
            <div className="grid grid-cols-5 gap-4 mb-6">
                <OrderStatusCard 
                    title="All Orders" 
                    count={allOrders.length} 
                    bgColor="bg-blue-50" 
                    icon="📦"
                    onClick={() => setFilter("All")}
                />
                <OrderStatusCard 
                    title="Pending Orders" 
                    count={allOrders.filter(order => order.status === "Pending").length} 
                    bgColor="bg-yellow-50" 
                    icon="⏳"
                    onClick={() => setFilter("Pending")}
                />
                <OrderStatusCard 
                    title="Shipped Orders" 
                    count={allOrders.filter(order => order.status === "Shipped").length} 
                    bgColor="bg-purple-50" 
                    icon="🚚"
                    onClick={() => setFilter("Shipped")}
                />
                <OrderStatusCard 
                    title="Completed Orders" 
                    count={allOrders.filter(order => order.status === "Delivered").length} 
                    bgColor="bg-green-50" 
                    icon="✅"
                    onClick={() => setFilter("Delivered")}
                />
                <OrderStatusCard 
                    title="Cancelled Orders" 
                    count={allOrders.filter(order => order.status === "Cancelled").length} 
                    bgColor="bg-red-50" 
                    icon="❌"
                    onClick={() => setFilter("Cancelled")}
                />
            </div>

            {/* 📦 Orders List */}
            <div className="overflow-y-auto max-h-[500px] space-y-4">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((item, index) => (
                        <div 
                            key={index} 
                            className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 p-4 border rounded-lg shadow-sm bg-white"
                        >
                            <div className="flex-1 text-sm text-gray-700">
                                <p className="text-lg font-semibold text-gray-900">Order ID: <span className="font-bold">{item.orderId}</span></p>
                                <p className="text-xs text-gray-600"><span className="font-medium">Date:</span> {item.date}</p>
                                <p className="text-xs text-gray-600"><span className="font-medium">Total Price:</span> ${item.total}</p>
                                <p className="text-xs text-gray-600"><span className="font-medium">No. of Products:</span> {item.products}</p>
                                <p className={`text-xs mt-1 font-semibold 
                                    ${item.status === "Delivered" ? "text-green-600" : 
                                    item.status === "Pending" ? "text-yellow-600" : 
                                    item.status === "Shipped" ? "text-blue-600" :
                                    item.status === "Cancelled" ? "text-red-600" : "text-gray-600"}
                                `}>
                                    Status: {item.status}
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 w-full sm:w-auto">
                                <button 
                                    className="text-sm text-gray-700 text-center w-full sm:w-48 py-2 border rounded-lg hover:bg-blue-500 hover:text-white transition-all duration-300"
                                    onClick={() => navigate('/order-tracking')}
                                >
                                    Order Info
                                </button>
                                <button 
                                    className="text-sm text-gray-700 text-center w-full sm:w-48 py-2 border rounded-lg hover:bg-yellow-500 hover:text-white transition-all duration-300"
                                    onClick={() => handlePrintInvoice(item.orderId)}
                                >
                                    Print Invoice
                                </button>
                                {item.status === "Pending" && (
                                    <button 
                                        className="text-sm text-gray-700 text-center w-full sm:w-48 py-2 border rounded-lg hover:bg-red-500 hover:text-white transition-all duration-300"
                                        onClick={() => cancelOrder(item.orderId)}
                                    >
                                        Cancel Order
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 mt-4">No orders found.</p>
                )}
            </div>
        </div>
    );
};

export default MyOrders;