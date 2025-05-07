import React, { useState, useContext, useEffect, useRef } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Line } from "react-chartjs-2";
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

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const OrderManagement = () => {
    const navigate = useNavigate();
    const { aToken, changeOrderStatus, fetchOrders } = useContext(AdminContext);
    const { backendUrl } = useContext(AppContext);
    
    // State management
    const [orders, setOrders] = useState([]);
    const [showOrderOverview, setShowOrderOverview] = useState(false);
    const [filter, setFilter] = useState("All");
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
    const [searchQuery, setSearchQuery] = useState("");
    const [dateRange, setDateRange] = useState({
        start: "",
        end: ""
    });
    const [deliveryStatusFilter, setDeliveryStatusFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("newest"); // "newest" or "oldest"
    const [overviewSearch, setOverviewSearch] = useState("");
    const [statusSearch, setStatusSearch] = useState("");
    const [overviewSort, setOverviewSort] = useState("newest");
    const [statusSort, setStatusSort] = useState("newest");
    // New states for payment and refund data
    const [refundData, setRefundData] = useState([]);
    const [revenueData, setRevenueData] = useState([]);
    const [paymentSearchTerm, setPaymentSearchTerm] = useState("");
    const [filteredPaymentData, setFilteredPaymentData] = useState([]);
    const [paymentCurrentPage, setPaymentCurrentPage] = useState(1);
    const pageSize = 5;



    const cancelReasons = [
        "Incorrect delivery address",
        "Duplicate order",
        "Payment issue",
        "Ordered by mistake",
        "Product or service unavailable",
        "Delayed delivery or service",
        "Customer no longer needs the order",
        "Invalid or suspicious order activity",
        "Unable to reach customer",
        "Other"
    ];

    // District to Province mapping
    const districtToProvince = {
        'Colombo': 'Western Province',
        'Gampaha': 'Western Province',
        'Kalutara': 'Western Province',
        'Kandy': 'Central Province',
        'Matale': 'Central Province',
        'Nuwara Eliya': 'Central Province',
        'Galle': 'Southern Province',
        'Matara': 'Southern Province',
        'Hambantota': 'Southern Province',
        'Jaffna': 'Northern Province',
        'Kilinochchi': 'Northern Province',
        'Mannar': 'Northern Province',
        'Vavuniya': 'Northern Province',
        'Mullaitivu': 'Northern Province',
        'Trincomalee': 'Eastern Province',
        'Batticaloa': 'Eastern Province',
        'Ampara': 'Eastern Province',
        'Kurunegala': 'North Western Province',
        'Puttalam': 'North Western Province',
        'Anuradhapura': 'North Central Province',
        'Polonnaruwa': 'North Central Province',
        'Badulla': 'Uva Province',
        'Monaragala': 'Uva Province',
        'Ratnapura': 'Sabaragamuwa Province',
        'Kegalle': 'Sabaragamuwa Province'
    };

   // Fetch orders from backend
     const fetchOrdersData = async () => {
       try {
         const response = await axios.get("http://localhost:4000/api/orders/all", {
           headers: { Authorization: `Bearer ${aToken}` },
         });
         if (response.data.success) {
           const formattedOrders = response.data.orders.map((order, index) => ({
             ...order,
             key: index.toString(),
             customerName: `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`,
           }));
           setOrders(formattedOrders);
           setFilteredPaymentData(formattedOrders);
         }
       } catch (err) {
         console.error("Failed to fetch orders", err);
         toast.error("Failed to fetch orders");
       }
     };

     // Fetch refund and revenue data
       const fetchRefunds = async () => {
        const token = localStorage.getItem('aToken');
         try {
           const response = await axios.get("http://localhost:4000/api/refunds", {
             headers: { Authorization: `Bearer ${token}` },
           });
           if (response.data.success) {
             setRefundData(response.data.refunds);
           }
         } catch (err) {
           console.error("Error fetching refund data:", err);
           toast.error("Failed to fetch refunds");
         }
       };

       const fetchRevenue = async () => {
           try {
             const response = await axios.get("http://localhost:4000/api/revenue", {
               headers: { Authorization: `Bearer ${aToken}` },
             });
             if (response.data.success) {
               setRevenueData(response.data.revenue);
             }
           } catch (err) {
             console.error("Error fetching revenue data:", err);
             toast.error("Failed to fetch revenue");
           }
         };

    // Update order status
  const updateOrderStatus = async (orderId, newStatus, deliveryStatus) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/orders/change-status`,
        { orderId, status: newStatus, deliveryStatus },
        { headers: { Authorization: `Bearer ${aToken}` } }
      );
      if (response.data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.orderId === orderId ? { ...order, status: newStatus, deliveryStatus } : order
          )
        );
        setShowStatusModal(false);
        toast.success("Order status updated successfully!");
      } else {
        toast.error("Failed to update order status: " + response.data.message);
      }
    } catch (err) {
      console.error("Failed to update order status", err);
      toast.error("Failed to update order status. Please try again.");
    }
  };

    // Cancel order
  const cancelOrder = async (orderId, reason) => {
    try {
      const response = await axios.patch(
        `${backendUrl}/api/orders/${orderId}/cancel`,
        { cancelReason: reason },
        { headers: { Authorization: `Bearer ${aToken}` } }
      );
      if (response.data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.orderId === orderId ? { ...order, status: "Cancelled", cancelReason: reason } : order
          )
        );
        setShowCancelModal(false);
        toast.success("Order cancelled successfully!");
        fetchRefunds(); // Refresh refunds after cancellation
      } else {
        toast.error("Failed to cancel order: " + response.data.message);
      }
    } catch (err) {
      console.error("Failed to cancel order", err);
      toast.error("Failed to cancel order. Please try again.");
    }
  };

    // Initial data fetch
    useEffect(() => {
        fetchOrdersData();
        fetchRefunds();
        fetchRevenue();
    }, []);

    // Update the fetchDeliveryPartners function
    const fetchDeliveryPartners = async () => {
        try {
            console.log("Fetching delivery partners...");
            console.log("Using backend URL:", backendUrl);
            console.log("Using token:", aToken ? "Token exists" : "No token");

            const response = await axios.get(
                `${backendUrl}/api/deliveryPartners`,
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
        setSearchQuery(event.target.value);
    };

    // Update the handleMarkAsDelivered function
    const handleMarkAsDelivered = async (order) => {
        if (!order || !order._id) {
            toast.error("No order selected. Please try again.");
            return;
        }

        try {
            const response = await axios.post(
                `${backendUrl}/api/orders/change-status`,
                {
                    orderId: order.orderId,
                    status: "Delivered",
                    deliveryStatus: "Delivered"
                },
                {
                    headers: {
                        'Authorization': `Bearer ${aToken}`
                    }
                }
            );

            if (response.data.success) {
                toast.success("Order marked as delivered successfully!");
                setShowDeliveryAssignment(false);
                setSelectedOrder(null);
                fetchOrdersData(); // Refresh orders list
            } else {
                toast.error(response.data.message || "Failed to mark order as delivered");
            }
        } catch (error) {
            console.error("Error marking order as delivered:", error);
            toast.error(error.response?.data?.message || "Failed to mark order as delivered. Please try again.");
        }
    };

    // Update the renderDeliveryPartnerDropdown function
    const renderDeliveryPartnerDropdown = () => {
        if (!selectedOrder) return null;

        // Get the province for the selected order's district
        const orderProvince = districtToProvince[selectedOrder.shippingInfo.district];
        
        // Filter delivery partners by province and availability
        const availablePartners = deliveryPartners.filter(partner => 
            partner.province === orderProvince && partner.isAvailable
        );

        return (
            <select
                value={selectedPartner}
                onChange={(e) => setSelectedPartner(e.target.value)}
                className="w-full p-2 border rounded-md"
            >
                <option value="">Select Delivery Partner</option>
                {availablePartners.length > 0 ? (
                    availablePartners.map((partner) => (
                        <option 
                            key={partner._id} 
                            value={partner._id}
                        >
                            {partner.name} - {partner.vehicleType} ({partner.province})
                        </option>
                    ))
                ) : (
                    <option value="" disabled>
                        No available delivery partners in {orderProvince}
                    </option>
                )}
            </select>
        );
    };

    const handleCancelOrder = async (order) => {
        if (!cancelReason) {
            toast.error("Please select a cancellation reason");
            return;
        }

        try {
            const response = await axios.patch(
                `${backendUrl}/api/orders/${order._id}/cancel`,
                { cancelReason: cancelReason },
                {
                    headers: {
                        'Authorization': `Bearer ${aToken}`
                    }
                }
            );

            if (response.data.success) {
                toast.success("Order cancelled successfully!");
                setOrders(prevOrders =>
                    prevOrders.map(o =>
                        o._id === order._id
                            ? { ...o, status: "Cancelled", cancelReason: cancelReason }
                            : o
                    )
                );
                setShowCancelModal(false);
                setCancelReason("");
                setSelectedOrder(null);
            } else {
                toast.error(response.data.message || "Failed to cancel order");
            }
        } catch (error) {
            console.error("Error cancelling order:", error);
            toast.error(error.response?.data?.message || "Failed to cancel order. Please try again.");
        }
    };

    // Sorting logic for overview
    const getOverviewFilteredOrders = () => {
        let filtered = orders.filter(order =>
            (overviewSearch === "" || order.orderId.toLowerCase().includes(overviewSearch.toLowerCase())) &&
            (filter === "All" || order.status === filter)
        );
        if (overviewSort === "newest") {
            filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (overviewSort === "oldest") {
            filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (overviewSort === "priceLow") {
            filtered.sort((a, b) => a.totalAmount - b.totalAmount);
        } else if (overviewSort === "priceHigh") {
            filtered.sort((a, b) => b.totalAmount - a.totalAmount);
        }
        return filtered;
    };

    // Sorting logic for status control
    const getStatusFilteredOrders = () => {
        let filtered = orders.filter(order =>
            (statusSearch === "" || order.orderId.toLowerCase().includes(statusSearch.toLowerCase())) &&
            (filter === "All" || order.status === filter)
        );
        if (statusSort === "newest") {
            filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (statusSort === "oldest") {
            filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (statusSort === "priceLow") {
            filtered.sort((a, b) => a.totalAmount - b.totalAmount);
        } else if (statusSort === "priceHigh") {
            filtered.sort((a, b) => b.totalAmount - a.totalAmount);
        }
        return filtered;
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
                    {/* Compact Search Bar for Order Overview */}
                    <div className="flex items-center mb-4 gap-2">
                        <span className="text-gray-400 mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search by Order ID..."
                            value={overviewSearch}
                            onChange={e => setOverviewSearch(e.target.value)}
                            className="w-full p-1.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {overviewSearch && (
                            <button
                                onClick={() => setOverviewSearch("")}
                                className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                        <select
                            value={overviewSort}
                            onChange={e => setOverviewSort(e.target.value)}
                            className="ml-2 p-1.5 text-sm border rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="newest">Newest to Oldest</option>
                            <option value="oldest">Oldest to Newest</option>
                            <option value="priceLow">Price: Low to High</option>
                            <option value="priceHigh">Price: High to Low</option>
                        </select>
                    </div>

                    {/* Order Status Cards Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mb-4">
                        <OrderStatusCard
                            title="All Orders"
                            count={orders.length}
                            description=""
                            bgColor="bg-blue-50"
                            icon="📦"
                            onClick={() => setFilter("All")}
                            className="p-2"
                            titleSize="text-xs"
                            countSize="text-base"
                        />
                        <OrderStatusCard
                            title="Pending Orders"
                            count={orders.filter(order => order.status === "Pending").length}
                            description=""
                            bgColor="bg-blue-50"
                            icon="⏳"
                            onClick={() => setFilter("Pending")}
                            className="p-2"
                            titleSize="text-xs"
                            countSize="text-base"
                        />
                        <OrderStatusCard
                            title="Shipped Orders"
                            count={orders.filter(order => order.status === "Shipped").length}
                            description=""
                            bgColor="bg-blue-50"
                            icon="🚚"
                            onClick={() => setFilter("Shipped")}
                            className="p-2"
                            titleSize="text-xs"
                            countSize="text-base"
                        />
                        <OrderStatusCard
                            title="Completed Orders"
                            count={orders.filter(order => order.status === "Delivered").length}
                            description=""
                            bgColor="bg-blue-50"
                            icon="✅"
                            onClick={() => setFilter("Delivered")}
                            className="p-2"
                            titleSize="text-xs"
                            countSize="text-base"
                        />
                        <OrderStatusCard
                            title="Cancelled Orders"
                            count={orders.filter(order => order.status === "Cancelled").length}
                            description=""
                            bgColor="bg-blue-50"
                            icon="❌"
                            onClick={() => setFilter("Cancelled")}
                            className="p-2"
                            titleSize="text-xs"
                            countSize="text-base"
                        />
                    </div>

                    {/* Orders List */}
                    <div className="overflow-y-auto max-h-[500px] space-y-4">
                        {getOverviewFilteredOrders().length > 0 ? (
                            getOverviewFilteredOrders().map((item, index) => (
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
                                            <span className="font-medium">Date:</span> {formatDate(item.date)}
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
                    {/* Compact Search Bar for Status Control */}
                    <div className="flex items-center mb-4 gap-2">
                        <span className="text-gray-400 mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search by Order ID..."
                            value={statusSearch}
                            onChange={e => setStatusSearch(e.target.value)}
                            className="w-full p-1.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {statusSearch && (
                            <button
                                onClick={() => setStatusSearch("")}
                                className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                        <select
                            value={statusSort}
                            onChange={e => setStatusSort(e.target.value)}
                            className="ml-2 p-1.5 text-sm border rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="newest">Newest to Oldest</option>
                            <option value="oldest">Oldest to Newest</option>
                            <option value="priceLow">Price: Low to High</option>
                            <option value="priceHigh">Price: High to Low</option>
                        </select>
                    </div>

                    {/* Order Status Cards Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mb-4">
                        <OrderStatusCard
                            title="All Orders"
                            count={orders.length}
                            description=""
                            bgColor="bg-green-50"
                            icon="📦"
                            onClick={() => setFilter("All")}
                            className="p-2"
                            titleSize="text-xs"
                            countSize="text-base"
                        />
                        <OrderStatusCard
                            title="Pending Orders"
                            count={orders.filter(order => order.status === "Pending").length}
                            description=""
                            bgColor="bg-green-50"
                            icon="⏳"
                            onClick={() => setFilter("Pending")}
                            className="p-2"
                            titleSize="text-xs"
                            countSize="text-base"
                        />
                        <OrderStatusCard
                            title="Shipped Orders"
                            count={orders.filter(order => order.status === "Shipped").length}
                            description=""
                            bgColor="bg-green-50"
                            icon="🚚"
                            onClick={() => setFilter("Shipped")}
                            className="p-2"
                            titleSize="text-xs"
                            countSize="text-base"
                        />
                        <OrderStatusCard
                            title="Completed Orders"
                            count={orders.filter(order => order.status === "Delivered").length}
                            description=""
                            bgColor="bg-green-50"
                            icon="✅"
                            onClick={() => setFilter("Delivered")}
                            className="p-2"
                            titleSize="text-xs"
                            countSize="text-base"
                        />
                        <OrderStatusCard
                            title="Cancelled Orders"
                            count={orders.filter(order => order.status === "Cancelled").length}
                            description=""
                            bgColor="bg-green-50"
                            icon="❌"
                            onClick={() => setFilter("Cancelled")}
                            className="p-2"
                            titleSize="text-xs"
                            countSize="text-base"
                        />
                    </div>

                    {/* Orders List */}
                    <div className="overflow-y-auto max-h-[500px] space-y-4">
                        {getStatusFilteredOrders().length > 0 ? (
                            getStatusFilteredOrders().map((item, index) => (
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
                                            <span className="font-medium">Date:</span> {formatDate(item.date)}
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
                                            className="text-sm text-gray-700 text-center w-full sm:w-48 py-2 border rounded-lg hover:bg-blue-500 hover:text-white transition-all duration-300"
                                            onClick={() => openStatusModal(item)}
                                        >
                                            Update Status
                                        </button>
                                        {(item.status === "Pending" || item.status === "Shipped") && (
                                            <button
                                                className="text-sm text-gray-700 text-center w-full sm:w-48 py-2 border rounded-lg hover:bg-red-500 hover:text-white transition-all duration-300"
                                                onClick={() => {
                                                    setSelectedOrder(item);
                                                    setShowCancelModal(true);
                                                }}
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
            {showCancelModal && selectedOrder && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h3 className="text-lg font-semibold mb-4">Cancel Order</h3>
                        <p className="text-sm text-gray-600 mb-4">Please select a reason for canceling this order:</p>
                        
                        <select
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            className="w-full p-2 border rounded-md mb-4"
                        >
                            <option value="">Select a reason</option>
                            {cancelReasons.map((reason, index) => (
                                <option key={index} value={reason}>
                                    {reason}
                                </option>
                            ))}
                        </select>

                        <div className="flex justify-end gap-2">
                            <button
                                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setCancelReason("");
                                    setSelectedOrder(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                onClick={() => handleCancelOrder(selectedOrder)}
                            >
                                Confirm Cancellation
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delivery Assignment & Tracking */}
            {showDeliveryAssignment && (
                <div className="mt-4 space-y-4">
                    {/* Simplified Search Bar with Sorting */}
                    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            {/* Order ID Search */}
                            <div className="flex items-center flex-1">
                                <span className="text-gray-400 mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search by Order ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full p-1.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Sort Toggle Button */}
                            <button
                                onClick={() => setSortOrder(prev => prev === "newest" ? "oldest" : "newest")}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {sortOrder === "newest" ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    )}
                                </svg>
                                {sortOrder === "newest" ? "Newest First" : "Oldest First"}
                            </button>

                            {/* Clear Search Button */}
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Clear Search
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Assigned Deliveries Card */}
                        <button 
                            onClick={() => setDeliveryFilter("assigned")}
                            className={`p-3 rounded-lg transition-all duration-300 flex items-center justify-between ${
                                deliveryFilter === "assigned" 
                                    ? "bg-green-50 border-2 border-green-500" 
                                    : "bg-white border border-gray-200 hover:border-green-300"
                            }`}
                        >
                            <div>
                                <h3 className="text-sm font-semibold text-gray-800">Assigned Deliveries</h3>
                                <p className="text-xl font-bold text-green-600 mt-1">
                                    {orders.filter(order => order.deliveryPartner && order.estimatedDelivery && order.deliveryStatus === "Assigned").length}
                                </p>
                                <p className="text-xs text-gray-500">Orders with assigned partners</p>
                            </div>
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="text-green-600 text-sm">✓</span>
                            </div>
                        </button>

                        {/* Unassigned Deliveries Card */}
                        <button 
                            onClick={() => setDeliveryFilter("unassigned")}
                            className={`p-3 rounded-lg transition-all duration-300 flex items-center justify-between ${
                                deliveryFilter === "unassigned" 
                                    ? "bg-red-50 border-2 border-red-500" 
                                    : "bg-white border border-gray-200 hover:border-red-300"
                            }`}
                        >
                            <div>
                                <h3 className="text-sm font-semibold text-gray-800">Unassigned Deliveries</h3>
                                <p className="text-xl font-bold text-red-600 mt-1">
                                    {orders.filter(order => !order.deliveryPartner || !order.estimatedDelivery).length}
                                </p>
                                <p className="text-xs text-gray-500">Orders needing assignment</p>
                            </div>
                            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                                <span className="text-red-600 text-sm">!</span>
                            </div>
                        </button>

                        {/* Delivered Card */}
                        <button 
                            onClick={() => setDeliveryFilter("delivered")}
                            className={`p-3 rounded-lg transition-all duration-300 flex items-center justify-between ${
                                deliveryFilter === "delivered" 
                                    ? "bg-blue-50 border-2 border-blue-500" 
                                    : "bg-white border border-gray-200 hover:border-blue-300"
                            }`}
                        >
                            <div>
                                <h3 className="text-sm font-semibold text-gray-800">Delivered Orders</h3>
                                <p className="text-xl font-bold text-blue-600 mt-1">
                                    {orders.filter(order => order.deliveryStatus === "Delivered").length}
                                </p>
                                <p className="text-xs text-gray-500">Successfully delivered orders</p>
                            </div>
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 text-sm">✓</span>
                            </div>
                        </button>
                    </div>

                    {/* Orders List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {getOverviewFilteredOrders()
                            .filter(order => order.status !== 'Cancelled')
                            .filter(order => {
                                if (deliveryFilter === "assigned") {
                                    return order.deliveryPartner && order.estimatedDelivery && order.deliveryStatus === "Assigned";
                                } else if (deliveryFilter === "unassigned") {
                                    return !order.deliveryPartner || !order.estimatedDelivery;
                                } else if (deliveryFilter === "delivered") {
                                    return order.deliveryStatus === "Delivered";
                                }
                                return true;
                            })
                            .map((order, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-lg shadow-sm p-3 border border-gray-100 hover:shadow-md transition-all duration-300"
                                >
                                    {/* Order Details */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-semibold text-gray-900">
                                                Order #{order.orderId}
                                            </h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                order.deliveryStatus === "Delivered" ? "bg-blue-100 text-blue-800" :
                                                order.deliveryStatus === "Assigned" ? "bg-green-100 text-green-800" :
                                                "bg-red-100 text-red-800"
                                            }`}>
                                                {order.deliveryStatus || "Unassigned"}
                                            </span>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                                <span className="w-4">📅</span>
                                                <span>{formatDate(order.date)}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                                <span className="w-4">💰</span>
                                                <span>LKR {order.totalAmount}</span>
                                            </div>
                                            {order.deliveryPartner && (
                                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                                    <span className="w-4">🚚</span>
                                                    <span>{order.deliveryPartner.name}</span>
                                                </div>
                                            )}
                                            {order.estimatedDelivery && (
                                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                                    <span className="w-4">⏰</span>
                                                    <span>Est. Delivery: {formatDate(order.estimatedDelivery)}</span>
                                                </div>
                                            )}
                                        </div>

                                        {order.deliveryStatus === "Assigned" && (
                                            <button
                                                className="w-full px-2 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 text-xs"
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    handleMarkAsDelivered(order);
                                                }}
                                            >
                                                <span>Mark as Delivered</span>
                                                <span className="text-sm">✓</span>
                                            </button>
                                        )}
                                        {!order.deliveryPartner && (
                                            <button
                                                className="w-full px-2 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 text-xs"
                                                onClick={() => handleAssignDelivery(order)}
                                            >
                                                <span>Assign Delivery</span>
                                                <span className="text-sm">→</span>
                                            </button>
                                        )}
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
                        <h3 className="text-lg font-semibold mb-4">
                            {selectedOrder.deliveryStatus === "Assigned" ? "Mark as Delivered" : "Assign Delivery Partner"}
                        </h3>
                        
                        <div className="space-y-4">
                            {selectedOrder.deliveryStatus === "Assigned" ? (
                                <div className="text-center">
                                    <p className="text-gray-600 mb-4">Are you sure you want to mark this order as delivered?</p>
                                    <div className="flex justify-end gap-2 mt-4">
                                        <button
                                            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                                            onClick={() => {
                                                setShowDeliveryAssignment(false);
                                                setSelectedOrder(null);
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                            onClick={() => handleMarkAsDelivered(selectedOrder)}
                                        >
                                            Mark as Delivered
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Delivery Partner
                                        </label>
                                        {renderDeliveryPartnerDropdown()}
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
                                </>
                            )}
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

