import React, { useState, useContext, useEffect, useRef } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import OrderStatusCard from "../../components/OrderStatusCard";
import { FaSearch, FaTasks, FaChartLine, FaTruck } from "react-icons/fa";
import OrderVolumeChart from "../../components/OrderVolumeChart";
import OrderFulfillmentChart from "../../components/OrderFulfillmentChart";
import CancellationRateChart from "../../components/CancellationRateChart";
import OrderInfo from "../../components/OrderInfo"; 
import { AdminContext } from "../../context/AdminContext";
import OrderManagementDashboard from "../../components/OrderManagementDashboard";
import InvoicePrint from "../../components/InvoicePrint";
import { AppContext } from "../../context/AppContext";
import { toast } from 'react-toastify';

const OrderManagement = () => {
    const navigate = useNavigate();
    const { aToken, changeOrderStatus, fetchOrders } = useContext(AdminContext);
    const { backendUrl } = useContext(AppContext);
    
    // State management
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [showOrderOverview, setShowOrderOverview] = useState(false);
    const [filter, setFilter] = useState("All");
    const [searchTerm, setSearchTerm] = useState(""); 
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [newStatus, setNewStatus] = useState("");
    const [cancelReason, setCancelReason] = useState("");
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showOrderActions, setShowOrderActions] = useState(false);
    const [showDeliveryAssignment, setShowDeliveryAssignment] = useState(false);
    const [deliveryFilter, setDeliveryFilter] = useState("unassigned");
    const [selectedPartner, setSelectedPartner] = useState("");
    const [estimatedDelivery, setEstimatedDelivery] = useState("");
    const [showOrderAnalytics, setShowOrderAnalytics] = useState(true);
    const [selectedChart, setSelectedChart] = useState("");
    const [showOrderInfo, setShowOrderInfo] = useState(false);
    const printRef = useRef();
    const [deliveryPartners, setDeliveryPartners] = useState([]);

    // Fetch orders from backend
    const fetchOrdersData = async () => {
        try {
            const response = await axios.get("http://localhost:4000/api/orders/all");
            if (response.data.success) {
                setOrders(response.data.orders);
            }
        } catch (err) {
            console.error("Failed to fetch orders", err);
        }
    };

    // Update order status
    const updateOrderStatus = async (orderId, newStatus, deliveryStatus) => {
        try {
            const response = await axios.post(
                `${backendUrl}/api/orders/change-status`,
                { orderId, status: newStatus, deliveryStatus }
            );
            if (response.data.success) {
                // Update the local state with the new status
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order.orderId === orderId ? { ...order, status: newStatus, deliveryStatus } : order
                    )
                );
                setShowStatusModal(false);
                // Show success message
                alert("Order status updated successfully!");
            } else {
                alert("Failed to update order status: " + response.data.message);
            }
        } catch (err) {
            console.error("Failed to update order status", err);
            alert("Failed to update order status. Please try again.");
        }
    };

    // Cancel order
    const cancelOrder = async (orderId, reason) => {
        try {
            const response = await axios.patch(
                `${backendUrl}/api/orders/${orderId}/cancel`,
                { cancelReason: reason },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            if (response.data.success) {
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order._id === orderId
                            ? { ...order, status: "Cancelled", cancelReason: reason }
                            : order
                    )
                );
                setShowCancelModal(false);
                alert("Order cancelled successfully!");
            } else {
                alert("Failed to cancel order: " + response.data.message);
            }
        } catch (err) {
            console.error("Failed to cancel order", err);
            alert("Failed to cancel order. Please try again.");
        }
    };

    // Filter orders based on status and search term
    useEffect(() => {
        let filtered = orders;
        
        if (filter !== "All") {
            filtered = filtered.filter(order => order.status === filter);
        }

        if (searchTerm.trim()) {
            filtered = filtered.filter(order =>
                order.orderId.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredOrders(filtered);
    }, [orders, filter, searchTerm]);

    // Initial data fetch
    useEffect(() => {
        fetchOrdersData();
    }, []);

    // Update the fetchDeliveryPartners function
    const fetchDeliveryPartners = async () => {
        try {
            console.log("Fetching delivery partners...");
            console.log("Using backend URL:", backendUrl);
            console.log("Using token:", aToken ? "Token exists" : "No token");

            const response = await axios.get(
                `${backendUrl}/api/deliveryPartners/available`,
                {
                    headers: {
                        'Authorization': `Bearer ${aToken}`
                    }
                }
            );

            console.log("Full API response:", response);
            console.log("Response data:", response.data);

            if (response.data.success) {
                if (response.data.data && response.data.data.length > 0) {
                    console.log("Found delivery partners:", response.data.data);
                    setDeliveryPartners(response.data.data);
                } else {
                    console.log("No delivery partners found in response");
                    setDeliveryPartners([]);
                }
            } else {
                console.error("API returned success: false", response.data);
                toast.error(response.data.message || "Failed to fetch delivery partners");
            }
        } catch (error) {
            console.error("Error details:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            toast.error("Failed to fetch delivery partners. Please check console for details.");
        }
    };

    // Update the handleDeliveryAssignmentClick function
    const handleDeliveryAssignmentClick = () => {
        console.log("Delivery assignment clicked");
        setShowDeliveryAssignment(!showDeliveryAssignment);
        setShowOrderOverview(false);
        setShowOrderActions(false);
        setShowOrderAnalytics(false);
        if (!showDeliveryAssignment) {
            console.log("Fetching delivery partners...");
            fetchDeliveryPartners();
        }
    };

    // Add a useEffect to log delivery partners state changes
    useEffect(() => {
        console.log("Delivery partners state updated:", deliveryPartners);
    }, [deliveryPartners]);

    // Update the handleSaveDeliveryAssignment function
    const handleSaveDeliveryAssignment = async () => {
        if (!selectedOrder || !selectedOrder._id) {
            toast.error("No order selected. Please try again.");
            return;
        }

        if (!selectedPartner || !estimatedDelivery) {
            toast.error("Please select a delivery partner and set an estimated delivery time.");
            return;
        }

        try {
            const response = await axios.post(
                `${backendUrl}/api/deliveryPartners/assign`,
                {
                    orderId: selectedOrder._id,
                    deliveryPartnerId: selectedPartner,
                    estimatedDelivery: new Date(estimatedDelivery).toISOString()
                },
                {
                    headers: {
                        'Authorization': `Bearer ${aToken}`
                    }
                }
            );

            if (response.data.success) {
                toast.success("Delivery partner assigned successfully!");
                setShowDeliveryAssignment(false);
                setSelectedOrder(null);
                setSelectedPartner("");
                setEstimatedDelivery("");
                fetchOrdersData(); // Refresh orders list
            } else {
                toast.error(response.data.message || "Failed to assign delivery partner");
            }
        } catch (error) {
            console.error("Error assigning delivery partner:", error);
            toast.error(error.response?.data?.message || "Failed to assign delivery partner. Please try again.");
        }
    };

    // Update the delivery assignment button
    const handleAssignDelivery = async (order) => {
        if (!order || !order._id) {
            toast.error("Invalid order selected");
            return;
        }
        
        setSelectedOrder(order);
        setShowDeliveryAssignment(true);
        await fetchDeliveryPartners();
    };

    // Open Cancel Order Modal
    const openCancelModal = (order) => {
        setSelectedOrder(order);
        setShowCancelModal(true);
    };

    // Function to Open the Status Update Modal
    const openStatusModal = (order) => {
        setSelectedOrder(order); 
        setNewStatus(order.status); 
        
        // If trying to change to Shipped status, check delivery status first
        if (order.status === "Pending" && order.deliveryStatus !== "Assigned") {
            toast.warning("Please assign a delivery partner before shipping the order");
            setShowStatusModal(false);
            handleAssignDelivery(order); // Open delivery assignment modal
            return;
        }
        
        setShowStatusModal(true);
    };

    // Card click handlers
    const handleOrderOverviewClick = () => {
        setShowOrderOverview(!showOrderOverview);
        setShowOrderActions(false);
        setShowDeliveryAssignment(false);
        setShowOrderAnalytics(false);
    };

    const handleStatusControlClick = () => {
        setShowOrderActions(!showOrderActions);
        setShowOrderOverview(false);
        setShowDeliveryAssignment(false);
        setShowOrderAnalytics(false);
    };

    const handleAnalyticsClick = () => {
        setShowOrderAnalytics(!showOrderAnalytics);
        setShowOrderOverview(false);
        setShowOrderActions(false);
        setShowDeliveryAssignment(false);
    };

    // Search Function: Filter orders by Order ID
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    return (
        <div className="p-6">
            {/* Main Order Management Cards */}
            <OrderManagementDashboard 
                orders={orders} 
                onAnalyticsClick={handleAnalyticsClick}
                onOrderOverviewClick={handleOrderOverviewClick}
                onStatusControlClick={handleStatusControlClick}
                onDeliveryAssignmentClick={handleDeliveryAssignmentClick}
                
            />

            {/* Order Overview & Search Section */}
            {showOrderOverview && (
                <div className="mt-6">
                    {/* Search Bar */}
                    <div className="flex items-center gap-4 mb-6">
                        <input
                            type="text"
                            placeholder="Search by Order ID..."
                            className="p-2 border rounded-md w-full sm:w-1/2"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                        <button
                            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition-all"
                            onClick={() => setSearchTerm("")} 
                        >
                            Reset
                        </button>
                    </div>

                    {/* Order Status Cards Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                        <OrderStatusCard
                            title="All Orders"
                            count={orders.length}
                            description=""
                            bgColor="bg-blue-50"
                            icon="📦"
                            onClick={() => setFilter("All")}
                        />
                        <OrderStatusCard
                            title="Pending Orders"
                            count={orders.filter(order => order.status === "Pending").length}
                            description=""
                            bgColor="bg-blue-50"
                            icon="⏳"
                            onClick={() => setFilter("Pending")}
                        />
                        <OrderStatusCard
                            title="Shipped Orders"
                            count={orders.filter(order => order.status === "Shipped").length}
                            description=""
                            bgColor="bg-blue-50"
                            icon="🚚"
                            onClick={() => setFilter("Shipped")}
                        />
                        <OrderStatusCard
                            title="Completed Orders"
                            count={orders.filter(order => order.status === "Delivered").length}
                            description=""
                            bgColor="bg-blue-50"
                            icon="✅"
                            onClick={() => setFilter("Delivered")}
                        />
                        <OrderStatusCard
                            title="Cancelled Orders"
                            count={orders.filter(order => order.status === "Cancelled").length}
                            description=""
                            bgColor="bg-blue-50"
                            icon="❌"
                            onClick={() => setFilter("Cancelled")}
                        />
                    </div>

                    {/* Orders List */}
                    <div className="overflow-y-auto max-h-[500px] space-y-4">
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 p-4 border rounded-lg shadow-sm bg-white"
                                >
                                    {/* Order Details */}
                                    <div className="flex-1 text-sm text-gray-700">
                                        <p className="text-lg font-semibold text-gray-900">
                                            Order ID: <span className="font-bold">{item.orderId}</span>
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            <span className="font-medium">Date:</span> {item.date}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            <span className="font-medium">Total Price:</span> LKR {item.totalAmount}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            <span className="font-medium">No. of Products:</span> {item.products}
                                        </p>

                                        {/* Order Status */}
                                        <p
                                            className={`text-xs mt-1 font-semibold 
                                                ${item.status === "Delivered" ? "text-green-600" : 
                                                item.status === "Pending" ? "text-yellow-600" : 
                                                item.status === "Shipped" ? "text-blue-600" :
                                                item.status === "Cancelled" ? "text-red-600" : "text-gray-600"}
                                            `}
                                        >
                                            Status: {item.status}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                                        <button
                                            className="text-sm text-gray-700 text-center w-full sm:w-48 py-2 border rounded-lg hover:bg-yellow-500 hover:text-white transition-all duration-300"
                                            onClick={() => {
                                                setShowOrderInfo(true);
                                                setSelectedOrder(item);
                                            }}
                                        >
                                            Order Info
                                        </button>

                                        <InvoicePrint order={item} />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 mt-4">No orders found.</p>
                        )}
                    </div>
                </div>
            )}

            {showOrderInfo && selectedOrder && (
                <OrderInfo
                    selectedOrder={selectedOrder}
                    setShowOrderInfo={setShowOrderInfo}
                />
            )}

            {/* Hidden Print Container */}
            <div style={{ display: 'none' }}>
                {selectedOrder && (
                    <div ref={printRef}>
                        <OrderInfo
                            selectedOrder={selectedOrder}
                            isPrintMode={true}
                            setShowOrderInfo={() => {}}
                        />
                    </div>
                )}
            </div>

            {/* Orders List with Actions */}
            {showOrderActions && (
                <div className="mt-6">
                    {/* Search Bar */}
                    <div className="flex items-center gap-4 mb-6">
                        <input
                            type="text"
                            placeholder="Search by Order ID..."
                            className="p-2 border rounded-md w-full sm:w-1/2"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                        <button
                            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition-all"
                            onClick={() => setSearchTerm("")} 
                        >
                            Reset
                        </button>
                    </div>

                    {/* Order Status Cards Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                        <OrderStatusCard
                            title="All Orders"
                            count={orders.length}
                            description=""
                            bgColor="bg-green-50"
                            icon="📦"
                            onClick={() => setFilter("All")}
                        />
                        <OrderStatusCard
                            title="Pending Orders"
                            count={orders.filter(order => order.status === "Pending").length}
                            description=""
                            bgColor="bg-green-50"
                            icon="⏳"
                            onClick={() => setFilter("Pending")}
                        />
                        <OrderStatusCard
                            title="Shipped Orders"
                            count={orders.filter(order => order.status === "Shipped").length}
                            description=""
                            bgColor="bg-green-50"
                            icon="🚚"
                            onClick={() => setFilter("Shipped")}
                        />
                        <OrderStatusCard
                            title="Completed Orders"
                            count={orders.filter(order => order.status === "Delivered").length}
                            description=""
                            bgColor="bg-green-50"
                            icon="✅"
                            onClick={() => setFilter("Delivered")}
                        />
                        <OrderStatusCard
                            title="Cancelled Orders"
                            count={orders.filter(order => order.status === "Cancelled").length}
                            description=""
                            bgColor="bg-green-50"
                            icon="❌"
                            onClick={() => setFilter("Cancelled")}
                        />
                    </div>

                    {/* Orders List */}
                    <div className="overflow-y-auto max-h-[500px] space-y-4">
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 p-4 border rounded-lg shadow-sm bg-white"
                                >
                                    {/* Order Details */}
                                    <div className="flex-1 text-sm text-gray-700">
                                        <p className="text-lg font-semibold text-gray-900">
                                            Order ID: <span className="font-bold">{item.orderId}</span>
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            <span className="font-medium">Date: </span> {item.date}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            <span className="font-medium">Total Price: </span> LKR {item.totalAmount}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            <span className="font-medium">No. of Products: </span> {item.products}
                                        </p>

                                        {/* Order Status */}
                                        <p
                                            className={`text-xs mt-1 font-semibold 
                                                ${item.status === "Delivered" ? "text-green-600" : 
                                                item.status === "Pending" ? "text-yellow-600" : 
                                                item.status === "Shipped" ? "text-blue-600" :
                                                item.status === "Cancelled" ? "text-red-600" : "text-gray-600"}
                                            `}
                                        >
                                            Status: {item.status}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                                        <button
                                            className="text-sm text-gray-700 text-center w-full sm:w-48 py-2 border rounded-lg hover:bg-blue-500 hover:text-white transition-all duration-300"
                                            onClick={() => openStatusModal(item)}
                                        >
                                            Update Status
                                        </button>
                                        <button
                                            className="text-sm text-gray-700 text-center w-full sm:w-48 py-2 border rounded-lg hover:bg-red-500 hover:text-white transition-all duration-300"
                                            onClick={() => openCancelModal(item)}
                                        >
                                            Cancel Order
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 mt-4">No orders found.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Update Status Modal */}
            {showStatusModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h3 className="text-lg font-semibold">Update Order Status</h3>
                        <select
                            value={newStatus}
                            onChange={(e) => {
                                const selectedStatus = e.target.value;
                                // If changing to Shipped, check delivery status
                                if (selectedStatus === "Shipped" && selectedOrder.deliveryStatus !== "Assigned") {
                                    toast.warning("Please assign a delivery partner before shipping the order");
                                    setShowStatusModal(false);
                                    handleAssignDelivery(selectedOrder);
                                    return;
                                }
                                setNewStatus(selectedStatus);
                            }}
                            className="w-full p-2 border mt-2 rounded"
                        >
                            <option value="Pending">Pending</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                        </select>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setShowStatusModal(false)} className="px-4 py-2 bg-gray-300 rounded-md">
                                Cancel
                            </button>
                            <button onClick={() => { 
                                updateOrderStatus(selectedOrder.orderId, newStatus, selectedOrder.deliveryStatus);
                            }} 
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Order Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h3 className="text-lg font-semibold">Cancel Order</h3>
                        <p className="text-sm text-gray-600 mb-2">Please select a reason for canceling this order:</p>
                        <select
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            className="w-full p-2 border mt-2 rounded"
                        >
                            <option value="">Select a reason</option>
                            <option value="Price issues">Price issues</option>
                            <option value="Delivery Time">Delivery Time</option>
                            <option value="Customer Changed Mind">Customer Changed Mind</option>
                            <option value="Other">Other</option>
                        </select>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setShowCancelModal(false)} className="px-4 py-2 bg-gray-300 rounded-md">
                                Close
                            </button>
                            <button 
                                onClick={() => {
                                    if (!cancelReason) {
                                        alert("Please select a cancellation reason");
                                        return;
                                    }
                                    cancelOrder(selectedOrder._id, cancelReason);
                                }} 
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                                Cancel Order
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delivery Assignment & Tracking */}
            {showDeliveryAssignment && (
                <div className="mt-6 space-y-6">

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Assigned Deliveries Card */}
                        <button 
                            onClick={() => setDeliveryFilter("assigned")}
                            className={`p-4 rounded-lg transition-all duration-300 flex items-center justify-between ${
                                deliveryFilter === "assigned" 
                                    ? "bg-green-50 border-2 border-green-500" 
                                    : "bg-white border border-gray-200 hover:border-green-300"
                            }`}
                        >
                            <div>
                                <h3 className="text-base font-semibold text-gray-800">Assigned Deliveries</h3>
                                <p className="text-2xl font-bold text-green-600 mt-1">
                                    {orders.filter(order => order.deliveryPartner && order.estimatedDelivery).length}
                                </p>
                                <p className="text-xs text-gray-500">Orders with assigned partners</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="text-green-600">✓</span>
                            </div>
                        </button>

                        {/* Unassigned Deliveries Card */}
                        <button 
                            onClick={() => setDeliveryFilter("unassigned")}
                            className={`p-4 rounded-lg transition-all duration-300 flex items-center justify-between ${
                                deliveryFilter === "unassigned" 
                                    ? "bg-red-50 border-2 border-red-500" 
                                    : "bg-white border border-gray-200 hover:border-red-300"
                            }`}
                        >
                            <div>
                                <h3 className="text-base font-semibold text-gray-800">Unassigned Deliveries</h3>
                                <p className="text-2xl font-bold text-red-600 mt-1">
                                    {orders.filter(order => !order.deliveryPartner || !order.estimatedDelivery).length}
                                </p>
                                <p className="text-xs text-gray-500">Orders needing assignment</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                <span className="text-red-600">!</span>
                            </div>
                        </button>
                    </div>

                    {/* Orders List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {orders
                            .filter(order => 
                                deliveryFilter === "assigned"
                                    ? order.deliveryPartner && order.estimatedDelivery
                                    : !order.deliveryPartner || !order.estimatedDelivery
                            )
                            .map((order, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300"
                                >
                                    {/* Order Details */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-base font-semibold text-gray-900">
                                                Order #{order.orderId}
                                            </h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                order.status === "Delivered" ? "bg-green-100 text-green-800" :
                                                order.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                                                order.status === "Shipped" ? "bg-blue-100 text-blue-800" :
                                                order.status === "Cancelled" ? "bg-red-100 text-red-800" : 
                                                "bg-gray-100 text-gray-800"
                                            }`}>
                                                {order.status}
                                            </span>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <span className="w-4">📅</span>
                                                <span>{order.date}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <span className="w-4">💰</span>
                                                <span>LKR {order.totalAmount}</span>
                                            </div>
                                        </div>

                                        <button
                                            className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                                            onClick={() => handleAssignDelivery(order)}
                                        >
                                            <span>Assign Delivery</span>
                                            <span className="text-lg">→</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Delivery Assignment Modal */}
            {showDeliveryAssignment && selectedOrder && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h3 className="text-lg font-semibold mb-4">Assign Delivery Partner</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Delivery Partner
                                </label>
                                <select
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                                    value={selectedPartner || ""}
                                    onChange={(e) => setSelectedPartner(e.target.value)}
                                >
                                    <option value="">Select Delivery Partner</option>
                                    {deliveryPartners && deliveryPartners.length > 0 ? (
                                        deliveryPartners.map(partner => (
                                            <option key={partner._id} value={partner._id}>
                                                {partner.name} - {partner.vehicleType} ({partner.vehicleNumber})
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>No delivery partners available</option>
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Estimated Delivery
                                </label>
                                <input
                                    type="datetime-local"
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                                    value={estimatedDelivery || ""}
                                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                                    onClick={() => {
                                        setShowDeliveryAssignment(false);
                                        setSelectedOrder(null);
                                        setSelectedPartner("");
                                        setEstimatedDelivery("");
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    onClick={handleSaveDeliveryAssignment}
                                >
                                    Assign
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Analytics & Insights */}
            {showOrderAnalytics && (
                <div className="mt-6 space-y-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Sidebar with Analytics Cards */}
                        <div className="w-full lg:w-[350px] space-y-4">
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Analytics Dashboard</h2>
                                <p className="text-gray-500 text-sm">Track and analyze order performance metrics</p>
                            </div>
                            
                            <div className="space-y-4">
                                <div 
                                    className={`cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl shadow-sm transition-all duration-300 transform hover:scale-105 ${
                                        selectedChart === "Order Volume Trends" ? "ring-2 ring-blue-500" : ""
                                    }`}
                                    onClick={() => setSelectedChart("Order Volume Trends")}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800">Order Volume Trends</h3>
                                            <p className="text-sm text-gray-600">Track daily order patterns and growth</p>
                                        </div>
                                        <div className="text-blue-500 text-2xl">📈</div>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-sm text-blue-600">↑ 12%</span>
                                        <span className="text-xs text-gray-500">from last month</span>
                                    </div>
                                </div>
                                
                                <div 
                                    className={`cursor-pointer bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl shadow-sm transition-all duration-300 transform hover:scale-105 ${
                                        selectedChart === "Order Fulfillment Efficiency" ? "ring-2 ring-green-500" : ""
                                    }`}
                                    onClick={() => setSelectedChart("Order Fulfillment Efficiency")}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800">Fulfillment Efficiency</h3>
                                            <p className="text-sm text-gray-600">Monitor delivery speed and efficiency</p>
                                        </div>
                                        <div className="text-green-500 text-2xl">⚡</div>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-sm text-green-600">↓ 0.5 days</span>
                                        <span className="text-xs text-gray-500">avg. delivery time</span>
                                    </div>
                                </div>
                                
                                <div 
                                    className={`cursor-pointer bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl shadow-sm transition-all duration-300 transform hover:scale-105 ${
                                        selectedChart === "Order Cancellation Rate" ? "ring-2 ring-red-500" : ""
                                    }`}
                                    onClick={() => setSelectedChart("Order Cancellation Rate")}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800">Cancellation Rate</h3>
                                            <p className="text-sm text-gray-600">Analyze cancellation patterns</p>
                                        </div>
                                        <div className="text-red-500 text-2xl">📊</div>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-sm text-red-600">↓ 1.1%</span>
                                        <span className="text-xs text-gray-500">from last month</span>
                                    </div>
                                </div>
                            </div>

                            {/* Analytics Summary */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <div>
                                        <span className="text-sm text-gray-600">Total Orders</span>
                                            <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
                                        </div>
                                        <div className="text-gray-400 text-2xl">📦</div>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                                        <div>
                                        <span className="text-sm text-gray-600">Pending Orders</span>
                                            <p className="text-2xl font-bold text-yellow-600">
                                            {orders.filter(order => order.status === "Pending").length}
                                            </p>
                                        </div>
                                        <div className="text-yellow-400 text-2xl">⏳</div>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                        <div>
                                        <span className="text-sm text-gray-600">Completed Orders</span>
                                            <p className="text-2xl font-bold text-green-600">
                                            {orders.filter(order => order.status === "Delivered").length}
                                            </p>
                                        </div>
                                        <div className="text-green-400 text-2xl">✅</div>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                                        <div>
                                        <span className="text-sm text-gray-600">Cancelled Orders</span>
                                            <p className="text-2xl font-bold text-red-600">
                                            {orders.filter(order => order.status === "Cancelled").length}
                                            </p>
                                        </div>
                                        <div className="text-red-400 text-2xl">❌</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Analytics Content */}
                        <div className="flex-1">
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full">
                                {selectedChart ? (
                                    <div className="space-y-6">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-800">
                                                    {selectedChart}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {selectedChart === "Order Volume Trends" && "Daily order volume trends over time"}
                                                    {selectedChart === "Order Fulfillment Efficiency" && "Average time taken for each fulfillment stage"}
                                                    {selectedChart === "Order Cancellation Rate" && "Order completion and cancellation rates"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="h-[500px] bg-gray-50 rounded-lg p-4">
                                            {selectedChart === "Order Volume Trends" && (
                                                <OrderVolumeChart />
                                            )}
                                            {selectedChart === "Order Fulfillment Efficiency" && (
                                                <div className="h-full flex items-center justify-center">
                                                    <OrderFulfillmentChart />
                                                </div>
                                            )}
                                            {selectedChart === "Order Cancellation Rate" && (
                                                <div className="h-full">
                                                    <CancellationRateChart />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-[500px] flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-6xl mb-4">📊</div>
                                            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                                Select an Analytics View
                                            </h3>
                                            <p className="text-gray-500 max-w-md mx-auto">
                                                Choose from the available analytics options to view detailed insights about your orders
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagement;

