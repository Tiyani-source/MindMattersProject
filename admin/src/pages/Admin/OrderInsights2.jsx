// src/components/OrderInsights.jsx
import React, { useState, useContext, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto"; // Required for react-chartjs-2
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
import { toast } from "react-toastify";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
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
    "Other",
  ];

  // District to Province mapping
  const districtToProvince = {
    Colombo: "Western Province",
    Gampaha: "Western Province",
    Kalutara: "Western Province",
    Kandy: "Central Province",
    Matale: "Central Province",
    "Nuwara Eliya": "Central Province",
    Galle: "Southern Province",
    Matara: "Southern Province",
    Hambantota: "Southern Province",
    Jaffna: "Northern Province",
    Kilinochchi: "Northern Province",
    Mannar: "Northern Province",
    Vavuniya: "Northern Province",
    Mullaitivu: "Northern Province",
    Trincomalee: "Eastern Province",
    Batticaloa: "Eastern Province",
    Ampara: "Eastern Province",
    Kurunegala: "North Western Province",
    Puttalam: "North Western Province",
    Anuradhapura: "North Central Province",
    Polonnaruwa: "North Central Province",
    Badulla: "Uva Province",
    Monaragala: "Uva Province",
    Ratnapura: "Sabaragamuwa Province",
    Kegalle: "Sabaragamuwa Province",
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
    try {
      const response = await axios.get("http://localhost:4000/api/refunds", {
        headers: { Authorization: `Bearer ${aToken}` },
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

  // Fetch delivery partners
  const fetchDeliveryPartners = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/deliveryPartners`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      if (response.data.success) {
        setDeliveryPartners(response.data.data || []);
      } else {
        toast.error(response.data.message || "Failed to fetch delivery partners");
      }
    } catch (error) {
      console.error("Error fetching delivery partners:", error);
      toast.error("Failed to fetch delivery partners.");
    }
  };

  // Search and filter payment data
  useEffect(() => {
    if (paymentSearchTerm.trim() === "") {
      setFilteredPaymentData(orders);
    } else {
      const lowercasedSearch = paymentSearchTerm.toLowerCase();
      const filtered = orders.filter(
        (item) =>
          item.orderId.toLowerCase().includes(lowercasedSearch) ||
          item.customerName.toLowerCase().includes(lowercasedSearch) ||
          `lkr ${item.totalAmount}`.toLowerCase().includes(lowercasedSearch) ||
          item.paymentStatus.toLowerCase().includes(lowercasedSearch) ||
          formatDate(item.date).toLowerCase().includes(lowercasedSearch)
      );
      setFilteredPaymentData(filtered);
    }
    setPaymentCurrentPage(1);
  }, [paymentSearchTerm, orders]);

  // Pagination for payment table
  const indexOfLastItem = paymentCurrentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentPaymentItems = filteredPaymentData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPaymentPages = Math.ceil(filteredPaymentData.length / pageSize);

  // Payment status styling
  const getStatusStyle = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Refund Table component
  const RefundTable = () => {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h4 className="font-medium text-gray-700 mb-4">Refund Details</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Refund ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {refundData.length > 0 ? (
                refundData.map((refund, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{refund.refundId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{refund.orderId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">LKR {refund.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{refund.reason}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(refund.date)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No refunds available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Revenue Line Graph component
  const LineGraph = () => {
    const chartData = {
      labels: revenueData.map((item) => item.date),
      datasets: [
        {
          label: "Revenue",
          data: revenueData.map((item) => item.revenue),
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          fill: true,
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Date",
          },
        },
        y: {
          title: {
            display: true,
            text: "Revenue (LKR)",
          },
        },
      },
    };

    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h4 className="font-medium text-gray-700 mb-4">Revenue Over Time</h4>
        <Line data={chartData} options={options} />
      </div>
    );
  };

  // Dashboard Summary component
  const DashboardSummary = () => {
    const totalOrders = orders.length;
    const completedOrders = orders.filter((item) => item.paymentStatus === "Completed").length;
    const pendingOrders = orders.filter((item) => item.paymentStatus === "Pending").length;
    const totalRevenue = orders
      .filter((item) => item.paymentStatus === "Completed")
      .reduce((sum, item) => sum + item.totalAmount, 0);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-800">LKR {totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-gray-800">{totalOrders}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Completed Payments</p>
          <p className="text-2xl font-bold text-green-600">{completedOrders}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Pending Payments</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
        </div>
      </div>
    );
  };

  const handleDeliveryAssignmentClick = () => {
    setShowDeliveryAssignment(!showDeliveryAssignment);
    setShowOrderOverview(false);
    setShowOrderActions(false);
    setShowOrderAnalytics(false);
    if (!showDeliveryAssignment) {
      fetchDeliveryPartners();
    }
  };

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
          estimatedDelivery: new Date(estimatedDelivery).toISOString(),
        },
        { headers: { Authorization: `Bearer ${aToken}` } }
      );
      if (response.data.success) {
        toast.success("Delivery partner assigned successfully!");
        setShowDeliveryAssignment(false);
        setSelectedOrder(null);
        setSelectedPartner("");
        setEstimatedDelivery("");
        fetchOrdersData();
      } else {
        toast.error(response.data.message || "Failed to assign delivery partner");
      }
    } catch (error) {
      console.error("Error assigning delivery partner:", error);
      toast.error(error.response?.data?.message || "Failed to assign delivery partner.");
    }
  };

  const handleAssignDelivery = async (order) => {
    if (!order || !order._id) {
      toast.error("Invalid order selected");
      return;
    }
    setSelectedOrder(order);
    setShowDeliveryAssignment(true);
    await fetchDeliveryPartners();
  };

  const openCancelModal = (order) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    if (order.status === "Pending" && order.deliveryStatus !== "Assigned") {
      toast.warning("Please assign a delivery partner before shipping the order");
      setShowStatusModal(false);
      handleAssignDelivery(order);
      return;
    }
    setShowStatusModal(true);
  };

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

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

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
          deliveryStatus: "Delivered",
        },
        { headers: { Authorization: `Bearer ${aToken}` } }
      );
      if (response.data.success) {
        toast.success("Order marked as delivered successfully!");
        setShowDeliveryAssignment(false);
        setSelectedOrder(null);
        fetchOrdersData();
      } else {
        toast.error(response.data.message || "Failed to mark order as delivered");
      }
    } catch (error) {
      console.error("Error marking order as delivered:", error);
      toast.error(error.response?.data?.message || "Failed to mark order as delivered.");
    }
  };

  const renderDeliveryPartnerDropdown = () => {
    if (!selectedOrder) return null;
    const orderProvince = districtToProvince[selectedOrder.shippingInfo.district];
    const availablePartners = deliveryPartners.filter(
      (partner) => partner.province === orderProvince && partner.isAvailable
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
            <option key={partner._id} value={partner._id}>
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
      await cancelOrder(order.orderId, cancelReason);
      setCancelReason("");
      setSelectedOrder(null);
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order.");
    }
  };

  const getOverviewFilteredOrders = () => {
    let filtered = orders.filter(
      (order) =>
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

  const getStatusFilteredOrders = () => {
    let filtered = orders.filter(
      (order) =>
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
      <OrderManagementDashboard
        orders={orders}
        onAnalyticsClick={handleAnalyticsClick}
        onOrderOverviewClick={handleOrderOverviewClick}
        onStatusControlClick={handleStatusControlClick}
        onDeliveryAssignmentClick={handleDeliveryAssignmentClick}
      />

      {/* Dashboard Summary */}
      <DashboardSummary />

      {/* Payment Table */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h3 className="text-xl font-bold">Order Payments</h3>
          <div className="relative mt-4 md:mt-0">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search orders, customers..."
              value={paymentSearchTerm}
              onChange={(e) => setPaymentSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentPaymentItems.length > 0 ? (
                currentPaymentItems.map((item) => (
                  <tr key={item.key} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.orderId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.customerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">LKR {item.totalAmount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(item.paymentStatus)}`}>
                        {item.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.date)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No results found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredPaymentData.length > 0 ? indexOfFirstItem + 1 : 0}</span> to{" "}
                <span className="font-medium">{Math.min(indexOfLastItem, filteredPaymentData.length)}</span> of{" "}
                <span className="font-medium">{filteredPaymentData.length}</span> results
                {paymentSearchTerm && ` (filtered from ${orders.length} total)`}
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setPaymentCurrentPage(Math.max(1, paymentCurrentPage - 1))}
                  disabled={paymentCurrentPage === 1}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0 ${
                    paymentCurrentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  &laquo; Previous
                </button>
                {Array.from({ length: totalPaymentPages