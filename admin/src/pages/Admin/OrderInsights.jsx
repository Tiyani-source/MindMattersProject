import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import OrderStatusCard from "../../components/OrderStatusCard";
import { FaSearch, FaTasks, FaMoneyBillWave, FaChartLine,FaTruck } from "react-icons/fa";
import OrderVolumeChart from "../../components/OrderVolumeChart";
import OrderFulfillmentChart from "../../components/OrderFulfillmentChart";
import CancellationRateChart from "../../components/CancellationRateChart";
import RefundsChart from "../../components/RefundsChart";
import OrderInfo from "../../components/OrderInfo"; 
import { AdminContext } from "../../context/AdminContext";

const refundRequests = [
  {
    orderId: "ORD1001",
    refundStatus: "Pending",
    cancelReason: "Changed my mind",
  },
  {
    orderId: "ORD1002",
    refundStatus: "In Review",
    cancelReason: "Product was damaged",
  },
  {
    orderId: "ORD1003",
    refundStatus: "Processed",
    cancelReason: "Duplicate order",
  },
  {
    orderId: "ORD1004",
    refundStatus: "Rejected",
    cancelReason: "Outside return window",
  },
  {
    orderId: "ORD1005",
    refundStatus: "Pending",
    cancelReason: "Ordered by mistake",
  },
  {
    orderId: "ORD1006",
    refundStatus: "Pending",
    cancelReason: "Wrong size received",
  },
  {
    orderId: "ORD1007",
    refundStatus: "In Review",
    cancelReason: "Missing item in package",
  },
  {
    orderId: "ORD1008",
    refundStatus: "Processed",
    cancelReason: "Received wrong product",
  },
  {
    orderId: "ORD1009",
    refundStatus: "Rejected",
    cancelReason: "No longer needed",
  },
  {
    orderId: "ORD1010",
    refundStatus: "Pending",
    cancelReason: "Item arrived too late",
  },
  {
    orderId: "ORD1011",
    refundStatus: "In Review",
    cancelReason: "Quality not as expected",
  },
  {
    orderId: "ORD1012",
    refundStatus: "Processed",
    cancelReason: "Package was never delivered",
  },
  {
    orderId: "ORD1013",
    refundStatus: "Pending",
    cancelReason: "Changed shipping address",
  },
  {
    orderId: "ORD1014",
    refundStatus: "Rejected",
    cancelReason: "Non-refundable item",
  },
  {
    orderId: "ORD1015",
    refundStatus: "Pending",
    cancelReason: "Customer support advised cancellation",
  },
];

const OrderManagement = () => { // using sampleOrders
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
    const [showRefundManagement, setShowRefundManagement] = useState(false);
    const [showRefundStatusModal, setShowRefundStatusModal] = useState(false);
    const [selectedRefundOrder, setSelectedRefundOrder] = useState(null);
    const [newRefundStatus, setNewRefundStatus] = useState("");
    const [selectedRefundFilter, setSelectedRefundFilter] = useState("Pending");
    const [showDeliveryAssignment, setShowDeliveryAssignment] = useState(false);
    const [deliveryFilter, setDeliveryFilter] = useState("unassigned");
    const [selectedPartner, setSelectedPartner] = useState("");
    const [estimatedDelivery, setEstimatedDelivery] = useState("");
    const [showOrderAnalytics, setShowOrderAnalytics] = useState(false);
    const [selectedChart, setSelectedChart] = useState(""); // Tracks which chart to show
    const [showOrderInfo, setShowOrderInfo] = useState(false);
    const printRef = useRef();





{/* Dynamic Order Analytics Chart */}
<div className="mt-6 bg-white p-6 rounded-lg shadow-lg w-full">
    {selectedChart === "Order Volume Trends" && <OrderVolumeChart />}
    {selectedChart === "Order Fulfillment Efficiency" && <OrderFulfillmentChart />}
    {selectedChart === "Order Cancellation Rate" && <CancellationRateChart />}
    {selectedChart === "Refunds: Requested vs. Approved" && <RefundsChart />}
</div>



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
  
const updateRefundStatus = () => {
  if (selectedRefundOrder) {
    const updatedRequests = refundRequests.map((order) =>
      order.orderId === selectedRefundOrder.orderId
        ? { ...order, refundStatus: newRefundStatus }
        : order
    );
    // NOTE: In real app, you'd use setRefundRequests(updatedRequests)
    // Since it's static here, just log for simulation:
    console.log("Updated Refund Requests:", updatedRequests);
  }

  setShowRefundStatusModal(false);
};

const openRefundStatusModal = (order) => {
  setSelectedRefundOrder(order);
  setNewRefundStatus(order.refundStatus || "Pending");
  setShowRefundStatusModal(true);
};

//  Function to Open the Status Update Modal
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

  setShowStatusModal(false); // Close modal after updating
};

    // Cancel Order & Move to Refund Processing
    const cancelOrder = () => {
        if (!selectedOrder) return;

        setOrders(prevOrders => prevOrders.map(order =>
            order.orderId === selectedOrder.orderId
                ? { ...order, status: "Cancelled", refundStatus: "Pending", cancelReason }
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">

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

      {/* Refund Management */}
      <OrderStatusCard
        title="Refund Management"
        count={refundRequests.length}
        description="Review and process refund requests"
        bgColor="bg-yellow-50"
        icon={<FaMoneyBillWave className="text-yellow-500 text-2xl" />}
        onClick={() => setShowRefundManagement(!showRefundManagement)}
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

      {/* Order Overview & Search Section (Only Show When Clicked) */}
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

        {/*  Orders List */}
        <div className="overflow-y-auto max-h-[500px] space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((item, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 p-4 border rounded-lg shadow-sm bg-white"
              >
                {/*  Order Details */}
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
                       
                        setNewStatus(e.target.value)}
                      }
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


      {/* Refund Management Section (Only show when toggled) */}
      {showRefundManagement && (
      <div className="mt-4 max-h-[calc(90vh-150px)] overflow-y-auto space-y-4">
        <h2 className="text-xl font-bold mb-4">Refund Requests</h2>

        {/* Flex container for left and right sections */}
        <div className="flex flex-col lg:flex-row gap-6 w-full">
          {/* Refund Summary Cards */}
          <div className="flex flex-col gap-0.5 w-full lg:w-[300px]">

            <OrderStatusCard
              title="Pending"
              count={refundRequests.filter(order => order.refundStatus === "Pending").length}
              description="Awaiting review"
              bgColor="bg-purple-20"
              icon="⏳"
              onClick={() => setSelectedRefundFilter("Pending")}
            />

            <OrderStatusCard
              title="In Review"
              count={refundRequests.filter(req => req.refundStatus === "In Review").length}
              description="Under assessment"
              bgColor="bg-purple-20"
              icon="🔍"
              onClick={() => setSelectedRefundFilter("In Review")}
            />

            <OrderStatusCard
              title="Processed"
              count={refundRequests.filter(req => req.refundStatus === "Processed").length}
              description="Completed"
              bgColor="bg-purple-20"
              icon="✅"
              onClick={() => setSelectedRefundFilter("Processed")}
            />

            <OrderStatusCard
              title="Rejected"
              count={refundRequests.filter(req => req.refundStatus === "Rejected").length}
              description="Not eligible for refund"
              bgColor="bg-purple-20"
              icon="❌"
              onClick={() => setSelectedRefundFilter("Rejected")}
            />
          </div>

          {/* Refund Requests List */}
          <div className="flex-1 space-y-4 overflow-y-auto">

          {refundRequests.length > 0 ? (
            refundRequests
              .filter(order => order.refundStatus === selectedRefundFilter)
              .map((order, index) => (

                <div key={index} className="flex flex-col sm:flex-row sm:justify-between items-center p-4 border rounded-lg shadow-sm bg-white">
                  <div className="text-sm text-gray-700 flex-1">

                    <p className="text-lg font-semibold text-gray-900">
                      Order ID: <span className="font-bold">{order.orderId}</span>
                    </p>

                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Reason:</span>{" "}
                      {order.cancelReason ? order.cancelReason : "Not provided"}
                    </p>

                    <p
                      className={`text-xs mt-1 font-semibold ${
                        order.refundStatus === "Pending"
                          ? "text-yellow-600"
                          : order.refundStatus === "In Review"
                          ? "text-blue-600"
                          : order.refundStatus === "Processed"
                          ? "text-green-600"
                          : "text-gray-600"
                      }`}
                    >
                      <span className="font-medium">Refund Status:</span>{" "}
                      {order.refundStatus ? order.refundStatus : "Not started"}
                    </p>
                  </div>

                  {/* Update Refund Status Button */}
                  <button
                    className="px-3 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 mt-4 sm:mt-0"
                    onClick={() => openRefundStatusModal(order)}
                  >
                    Update Refund Status
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 mt-4">No refund requests found.</p>
            )}
          </div>
        </div>
      </div>
    )}
          {showRefundStatusModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                      <h3 className="text-lg font-semibold">Update Refund Status</h3>
                      <select
                          value={newRefundStatus}
                          onChange={(e) => setNewRefundStatus(e.target.value)}
                          className="w-full p-2 border mt-2 rounded"
                      >
                          <option value="Pending">Pending</option>
                          <option value="In Review">In Review</option>
                          <option value="Processed">Processed</option>
                          <option value="Rejected">Rejected</option>
                      </select>
                      <div className="flex justify-end gap-2 mt-4">
                          <button
                              onClick={() => setShowRefundStatusModal(false)}
                              className="px-4 py-2 bg-gray-300 rounded-md"
                          >
                              Cancel
                          </button>
                          <button
                              onClick={updateRefundStatus}
                              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                          >
                              Update
                          </button>
                      </div>
                  </div>
              </div>
          )}

  {/* Delivery Assignment & Tracking */}
  {showDeliveryAssignment && (
          <div className="mt-6 space-y-6">
            <h2 className="text-xl font-bold mb-4">Assign Delivery for Orders</h2>

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
                  {
                    orders.filter(
                      (order) => order.deliveryPartner && order.estimatedDelivery
                    ).length
                  }{" "}
                  orders have assigned delivery partners.
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
                  {
                    orders.filter(
                      (order) => !order.deliveryPartner || !order.estimatedDelivery
                    ).length
                  }{" "}
                  orders need delivery assignment.
                </p>
              </div>
            </div>

            {/* Orders List  */}
            <div className="max-h-[65vh] overflow-y-auto space-y-4 pr-2">
              {orders
                .filter((order) =>
                  deliveryFilter === "assigned"
                    ? order.deliveryPartner && order.estimatedDelivery
                    : !order.deliveryPartner || !order.estimatedDelivery
                )
                .map((order, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg shadow-sm bg-white flex flex-col gap-2"
                  >
                    <div className="text-sm text-gray-700">
                      <p className="font-semibold text-gray-900 text-lg">
                        Order ID: <span className="font-bold">{order.orderId}</span>
                      </p>
                      <p className="text-xs text-gray-600">Status: {order.status}</p>
                    </div>

                    <select
                      className="p-2 border rounded-md w-full sm:w-1/2"
                      value={order.deliveryPartner || ""}
                      onChange={(e) => {
                        const updated = [...orders];
                        updated[index].deliveryPartner = e.target.value;
                        setOrders(updated);
                      }}
                    >
                      <option value="">Select Delivery Partner</option>
                      <option value="DHL">DHL Express</option>
                      <option value="FedEx">FedEx</option>
                      <option value="UPS">UPS</option>
                      <option value="BlueDart">BlueDart</option>
                    </select>

                    <input
                      type="datetime-local"
                      className="p-2 border rounded-md w-full sm:w-1/2"
                      value={order.estimatedDelivery || ""}
                      onChange={(e) => {
                        const updated = [...orders];
                        updated[index].estimatedDelivery = e.target.value;
                        setOrders(updated);
                      }}
                    />

                    <button
                      className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-all w-fit"
                      onClick={() => {
                        alert(`Delivery Assigned for ${order.orderId} ✅`);
                        console.log({
                          orderId: order.orderId,
                          partner: order.deliveryPartner,
                          time: order.estimatedDelivery,
                        });
                      }}
                    >
                      Assign Delivery
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}


  {/* Order Analytics & Insights */}
  {showOrderAnalytics && (
      <div className="mt-6">
          {/* Sidebar with Order Analytics Cards */}
          <div className="w-[450px] flex flex-col gap-1 mt-4">
              <OrderStatusCard 
                  title="Order Volume Trends"
                  count={null} 
                  description="Track how many orders were placed over the last 30 days."
                  bgColor="bg-blue-50"
                  icon="📆"
                  onClick={() => setSelectedChart("Order Volume Trends")}
              />
              <OrderStatusCard 
                  title=" Order Fulfillment Efficiency"
                  count={null} 
                  description="Measure the average time it takes from order placement to delivery."
                  bgColor="bg-green-50"
                  icon="📉"
                  onClick={() => setSelectedChart("Order Fulfillment Efficiency")}
              />
              <OrderStatusCard 
                  title=" Order Cancellation Rate"
                  count={null} 
                  description="Analyze how many orders get canceled before fulfillment."
                  bgColor="bg-red-50"
                  icon="❌"
                  onClick={() => setSelectedChart("Order Cancellation Rate")}
              />
              <OrderStatusCard 
                  title=" Refunds: Requested vs. Approved"
                  count={null} 
                  description="Compare refund requests to successfully processed refunds."
                  bgColor="bg-yellow-50"
                  icon="🔄"
                  onClick={() => setSelectedChart("Refunds: Requested vs. Approved")}
              />
          </div>

          {/* Dynamic Order Analytics Chart */}
          <div className="mt-6 bg-white p-6 rounded-lg shadow-lg w-full">
              {selectedChart === "Order Volume Trends" && <OrderVolumeChart />}
              {selectedChart === "Order Fulfillment Efficiency" && <OrderFulfillmentChart />}
              {selectedChart === "Order Cancellation Rate" && <CancellationRateChart />}
              {selectedChart === "Refunds: Requested vs. Approved" && <RefundsChart />}
          </div>
      </div>
  )}

      </div>
      
    );
  };

export default OrderManagement;

