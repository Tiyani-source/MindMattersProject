import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import OrderStatusCard from "../../components/OrderStatusCard";
import { FaSearch, FaTasks, FaChartLine, FaTruck } from "react-icons/fa";
import OrderVolumeChart from "../../components/OrderVolumeChart";
import OrderFulfillmentChart from "../../components/OrderFulfillmentChart";
import CancellationRateChart from "../../components/CancellationRateChart";
import OrderInfo from "../../components/OrderInfo"; 
import { AdminContext } from "../../context/AdminContext";

const OrderManagement = () => {
    const navigate = useNavigate();
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
    const [showOrderAnalytics, setShowOrderAnalytics] = useState(false);
    const [selectedChart, setSelectedChart] = useState("");
    const [showOrderInfo, setShowOrderInfo] = useState(false);
    const printRef = useRef();

    // Function to Handle Saving Delivery Assignment
    const handleSaveDeliveryAssignment = () => {
        if (!selectedPartner || !estimatedDelivery) {
            alert("Please select a delivery partner and set an estimated delivery time.");
            return;
        }

        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.orderId === selectedOrder.orderId
                    ? { ...order, deliveryPartner: selectedPartner, estimatedDelivery }
                    : order
            )
        );

        alert("Delivery assignment saved successfully!"); 
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
        setShowStatusModal(true);
    };

    // Function to Update the Order Status
    const updateOrderStatus = () => {
        if (!selectedOrder) return;

        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.orderId === selectedOrder.orderId ? { ...order, status: newStatus } : order
            )
        );

        setShowStatusModal(false);
    };

    // Cancel Order
    const cancelOrder = () => {
        if (!selectedOrder) return;

        setOrders(prevOrders => prevOrders.map(order =>
            order.orderId === selectedOrder.orderId
                ? { ...order, status: "Cancelled", cancelReason }
                : order
        ));

        setShowCancelModal(false);
    };

    // Define analyticsSummary
    const analyticsSummary = "Last 30 days: 150+ orders processed.";

    // Toggle Order Overview & Search Section
    const handleOrderOverviewClick = () => {
        setShowOrderOverview(!showOrderOverview);
    };

    // Search Function: Filter orders by Order ID
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const { aToken, changeOrderStatus, sampleOrders, fetchOrders } = useContext(AdminContext)

    // Filter Orders based on status and search term
    let filteredOrders = filter === "All" ? sampleOrders : sampleOrders.filter(order => order.status === filter);

    if (searchTerm) {
        filteredOrders = filteredOrders.filter(order =>
            order.orderId.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    return (
        <div className="p-6">
            {/* Main Order Management Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {/* Order Overview & Search */}
                <OrderStatusCard
                    title="Order Overview & Search"
                    count={sampleOrders.length}
                    description="Search orders by Order IDs"
                    bgColor="bg-blue-50"
                    icon={<FaSearch className="text-blue-500 text-2xl" />}
                    onClick={handleOrderOverviewClick}
                />

                {/* Order Status Control & Actions */}
                <OrderStatusCard
                    title="Order Status Control & Actions"
                    count={sampleOrders.length}
                    description="Update order statuses and manage processing actions"
                    bgColor="bg-green-50"
                    icon={<FaTasks className="text-green-500 text-2xl" />}
                    onClick={() => setShowOrderActions(!showOrderActions)} 
                />

                {/* Delivery Assignment & Tracking */}
                <OrderStatusCard
                    title="Delivery Assignment & Tracking"
                    count={null}
                    description="Assign delivery partners & set estimated delivery times"
                    bgColor="bg-purple-50"
                    icon={<FaTruck className="text-purple-500 text-2xl" />}
                    onClick={() => setShowDeliveryAssignment(!showDeliveryAssignment)}
                />

                {/* Order Analytics & Insights */}
                <OrderStatusCard
                    title="Order Analytics & Insights"
                    count={null}
                    description="Track order trends and analyze performance"
                    bgColor="bg-red-50"
                    icon={<FaChartLine className="text-red-500 text-2xl" />}
                    onClick={() => setShowOrderAnalytics(!showOrderAnalytics)}
                />
            </div>

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
                            count={sampleOrders.length}
                            description=""
                            bgColor="bg-blue-50"
                            icon="📦"
                            onClick={() => setFilter("All")}
                        />
                        <OrderStatusCard
                            title="Pending Orders"
                            count={sampleOrders.filter(order => order.status === "Pending").length}
                            description=""
                            bgColor="bg-blue-50"
                            icon="⏳"
                            onClick={() => setFilter("Pending")}
                        />
                        <OrderStatusCard
                            title="Shipped Orders"
                            count={sampleOrders.filter(order => order.status === "Shipped").length}
                            description=""
                            bgColor="bg-blue-50"
                            icon="🚚"
                            onClick={() => setFilter("Shipped")}
                        />
                        <OrderStatusCard
                            title="Completed Orders"
                            count={sampleOrders.filter(order => order.status === "Delivered").length}
                            description=""
                            bgColor="bg-blue-50"
                            icon="✅"
                            onClick={() => setFilter("Delivered")}
                        />
                        <OrderStatusCard
                            title="Cancelled Orders"
                            count={sampleOrders.filter(order => order.status === "Cancelled").length}
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

                                        <button
                                            className="text-sm text-gray-700 text-center w-full sm:w-48 py-2 border rounded-lg hover:bg-yellow-500 hover:text-white transition-all duration-300"
                                            onClick={() => {
                                                setSelectedOrder(item);
                                                setTimeout(() => {
                                                    if (printRef.current) {
                                                        const printContents = printRef.current.innerHTML;
                                                        const printWindow = window.open('', '', 'width=800,height=600');
                                                        printWindow.document.write(`
                                                            <html>
                                                                <head>
                                                                    <title>Invoice - ${item.orderId}</title>
                                                                    <style>
                                                                        body { font-family: Arial, sans-serif; padding: 20px; }
                                                                        h2 { text-align: center; margin-bottom: 24px; }
                                                                        .section { margin-bottom: 16px; }
                                                                        p { margin: 4px 0; }
                                                                    </style>
                                                                </head>
                                                                <body>
                                                                    ${printContents}
                                                                </body>
                                                            </html>
                                                        `);
                                                        printWindow.document.close();
                                                        printWindow.focus();
                                                        printWindow.print();
                                                        printWindow.close();
                                                    }
                                                }, 0);
                                            }}
                                        >
                                            Print Invoice
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
                            count={sampleOrders.length}
                            description=""
                            bgColor="bg-green-50"
                            icon="📦"
                            onClick={() => setFilter("All")}
                        />
                        <OrderStatusCard
                            title="Pending Orders"
                            count={sampleOrders.filter(order => order.status === "Pending").length}
                            description=""
                            bgColor="bg-green-50"
                            icon="⏳"
                            onClick={() => setFilter("Pending")}
                        />
                        <OrderStatusCard
                            title="Shipped Orders"
                            count={sampleOrders.filter(order => order.status === "Shipped").length}
                            description=""
                            bgColor="bg-green-50"
                            icon="🚚"
                            onClick={() => setFilter("Shipped")}
                        />
                        <OrderStatusCard
                            title="Completed Orders"
                            count={sampleOrders.filter(order => order.status === "Delivered").length}
                            description=""
                            bgColor="bg-green-50"
                            icon="✅"
                            onClick={() => setFilter("Delivered")}
                        />
                        <OrderStatusCard
                            title="Cancelled Orders"
                            count={sampleOrders.filter(order => order.status === "Cancelled").length}
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
                            onChange={(e) => setNewStatus(e.target.value)}
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
                                changeOrderStatus(selectedOrder.orderId, newStatus);
                                updateOrderStatus();}
                            } 
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
                        <p className="text-sm text-gray-600">Please provide a reason for canceling this order:</p>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            className="w-full p-2 border mt-2 rounded h-24"
                        ></textarea>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setShowCancelModal(false)} className="px-4 py-2 bg-gray-300 rounded-md">
                                Close
                            </button>
                            <button onClick={cancelOrder} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                                Cancel Order
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delivery Assignment & Tracking */}
            {showDeliveryAssignment && (
                <div className="mt-6 space-y-6">
                    <h2 className="text-xl font-bold mb-4">Delivery Assignment & Tracking</h2>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        {/* Assigned Deliveries */}
                        <div
                            className={`cursor-pointer bg-green-50 border-l-4 p-4 rounded-md shadow-sm transition ${
                                deliveryFilter === "assigned"
                                    ? "border-green-600 ring-2 ring-green-300"
                                    : "border-green-200"
                            }`}
                            onClick={() => setDeliveryFilter("assigned")}
                        >
                            <h3 className="text-lg font-semibold text-gray-700">Assigned Deliveries</h3>
                            <p className="text-sm text-green-800">
                                {sampleOrders.filter(order => order.deliveryPartner && order.estimatedDelivery).length} orders have assigned delivery partners.
                            </p>
                        </div>

                        {/* Unassigned Deliveries */}
                        <div
                            className={`cursor-pointer bg-red-50 border-l-4 p-4 rounded-md shadow-sm transition ${
                                deliveryFilter === "unassigned"
                                    ? "border-red-600 ring-2 ring-red-300"
                                    : "border-red-200"
                            }`}
                            onClick={() => setDeliveryFilter("unassigned")}
                        >
                            <h3 className="text-lg font-semibold text-gray-700">Unassigned Deliveries</h3>
                            <p className="text-sm text-red-800">
                                {sampleOrders.filter(order => !order.deliveryPartner || !order.estimatedDelivery).length} orders need delivery assignment.
                            </p>
                        </div>
                    </div>

                    {/* Orders List */}
                    <div className="max-h-[65vh] overflow-y-auto space-y-4 pr-2">
                        {sampleOrders
                            .filter(order => 
                                deliveryFilter === "assigned"
                                    ? order.deliveryPartner && order.estimatedDelivery
                                    : !order.deliveryPartner || !order.estimatedDelivery
                            )
                            .map((order, index) => (
                                <div
                                    key={index}
                                    className="p-4 border rounded-lg shadow-sm bg-white"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Order Details */}
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Order ID: <span className="font-bold">{order.orderId}</span>
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Status:</span>{" "}
                                                <span className={`${
                                                    order.status === "Delivered" ? "text-green-600" :
                                                    order.status === "Pending" ? "text-yellow-600" :
                                                    order.status === "Shipped" ? "text-blue-600" :
                                                    order.status === "Cancelled" ? "text-red-600" : "text-gray-600"
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Date:</span> {order.date}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Total Amount:</span> LKR {order.totalAmount}
                                            </p>
                                        </div>

                                        {/* Delivery Assignment Form */}
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Delivery Partner
                                                </label>
                                                <select
                                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    value={order.deliveryPartner || ""}
                                                    onChange={(e) => {
                                                        const updatedOrders = [...sampleOrders];
                                                        updatedOrders[index] = {
                                                            ...order,
                                                            deliveryPartner: e.target.value
                                                        };
                                                        // Update the orders in your state management
                                                        // This is a placeholder - replace with your actual state update logic
                                                        console.log("Updated delivery partner:", updatedOrders[index]);
                                                    }}
                                                >
                                                    <option value="">Select Delivery Partner</option>
                                                    <option value="DHL">DHL Express</option>
                                                    <option value="FedEx">FedEx</option>
                                                    <option value="UPS">UPS</option>
                                                    <option value="BlueDart">BlueDart</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Estimated Delivery Date & Time
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    value={order.estimatedDelivery || ""}
                                                    onChange={(e) => {
                                                        const updatedOrders = [...sampleOrders];
                                                        updatedOrders[index] = {
                                                            ...order,
                                                            estimatedDelivery: e.target.value
                                                        };
                                                        // Update the orders in your state management
                                                        // This is a placeholder - replace with your actual state update logic
                                                        console.log("Updated delivery time:", updatedOrders[index]);
                                                    }}
                                                />
                                            </div>

                                            <button
                                                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                                                onClick={() => {
                                                    if (!order.deliveryPartner || !order.estimatedDelivery) {
                                                        alert("Please select both delivery partner and estimated delivery time");
                                                        return;
                                                    }
                                                    // Here you would typically make an API call to update the order
                                                    alert(`Delivery assigned for order ${order.orderId}`);
                                                    console.log("Delivery Assignment:", {
                                                        orderId: order.orderId,
                                                        partner: order.deliveryPartner,
                                                        time: order.estimatedDelivery
                                                    });
                                                }}
                                            >
                                                Assign Delivery
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
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
                                <OrderStatusCard 
                                    title="Order Volume Trends"
                                    count={null} 
                                    description="Track daily order patterns and growth"
                                    bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
                                    icon={<div className="text-blue-500 text-2xl">📈</div>}
                                    onClick={() => setSelectedChart("Order Volume Trends")}
                                    className={`transition-all duration-300 transform hover:scale-105 ${
                                        selectedChart === "Order Volume Trends" ? "ring-2 ring-blue-500" : ""
                                    }`}
                                />
                                
                                <OrderStatusCard 
                                    title="Order Fulfillment Efficiency"
                                    count={null} 
                                    description="Monitor delivery speed and efficiency"
                                    bgColor="bg-gradient-to-br from-green-50 to-green-100"
                                    icon={<div className="text-green-500 text-2xl">⚡</div>}
                                    onClick={() => setSelectedChart("Order Fulfillment Efficiency")}
                                    className={`transition-all duration-300 transform hover:scale-105 ${
                                        selectedChart === "Order Fulfillment Efficiency" ? "ring-2 ring-green-500" : ""
                                    }`}
                                />
                                
                                <OrderStatusCard 
                                    title="Order Cancellation Rate"
                                    count={null} 
                                    description="Analyze cancellation patterns and reasons"
                                    bgColor="bg-gradient-to-br from-red-50 to-red-100"
                                    icon={<div className="text-red-500 text-2xl">📊</div>}
                                    onClick={() => setSelectedChart("Order Cancellation Rate")}
                                    className={`transition-all duration-300 transform hover:scale-105 ${
                                        selectedChart === "Order Cancellation Rate" ? "ring-2 ring-red-500" : ""
                                    }`}
                                />
                            </div>

                            {/* Analytics Summary */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-600">Total Orders</span>
                                        <span className="font-semibold text-gray-800">{sampleOrders.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                                        <span className="text-sm text-gray-600">Pending Orders</span>
                                        <span className="font-semibold text-yellow-600">
                                            {sampleOrders.filter(order => order.status === "Pending").length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                        <span className="text-sm text-gray-600">Completed Orders</span>
                                        <span className="font-semibold text-green-600">
                                            {sampleOrders.filter(order => order.status === "Delivered").length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                                        <span className="text-sm text-gray-600">Cancelled Orders</span>
                                        <span className="font-semibold text-red-600">
                                            {sampleOrders.filter(order => order.status === "Cancelled").length}
                                        </span>
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
                                            <div className="flex items-center space-x-2">
                                                <select 
                                                    className="p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                                    defaultValue="30"
                                                >
                                                    <option value="7">Last 7 Days</option>
                                                    <option value="30">Last 30 Days</option>
                                                    <option value="90">Last 90 Days</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="h-[500px] bg-gray-50 rounded-lg p-4">
                                            {selectedChart === "Order Volume Trends" && (
                                                <div className="h-full flex items-center justify-center">
                                                    <OrderVolumeChart />
                                                </div>
                                            )}
                                            {selectedChart === "Order Fulfillment Efficiency" && (
                                                <div className="h-full flex items-center justify-center">
                                                    <OrderFulfillmentChart />
                                                </div>
                                            )}
                                            {selectedChart === "Order Cancellation Rate" && (
                                                <div className="h-full flex items-center justify-center">
                                                    <CancellationRateChart />
                                                </div>
                                            )}
                                        </div>

                                        {/* Chart Summary */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                                <h4 className="text-sm font-medium text-blue-800">Average Daily Orders</h4>
                                                <p className="text-2xl font-bold text-blue-600 mt-1">24</p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <span className="text-xs text-blue-600">↑ 12%</span>
                                                    <span className="text-xs text-gray-500">from last month</span>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                                <h4 className="text-sm font-medium text-green-800">Average Fulfillment Time</h4>
                                                <p className="text-2xl font-bold text-green-600 mt-1">2.5 days</p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <span className="text-xs text-green-600">↓ 0.5 days</span>
                                                    <span className="text-xs text-gray-500">from last month</span>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                                                <h4 className="text-sm font-medium text-red-800">Cancellation Rate</h4>
                                                <p className="text-2xl font-bold text-red-600 mt-1">3.2%</p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <span className="text-xs text-red-600">↓ 1.1%</span>
                                                    <span className="text-xs text-gray-500">from last month</span>
                                                </div>
                                            </div>
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

