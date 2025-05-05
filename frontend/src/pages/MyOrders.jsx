import React, { useContext, useEffect, useRef,useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import OrderStatusCard from '../components/OrderStatusCard';
import OrderInfo from '../components/OrderInfo';


const MyOrders = () => {
  const navigate = useNavigate();
  const {
    studentData,
    orders,
    fetchOrders,
    cancelOrder,
    handlePrintInvoice,
    getFilteredOrders,
  } = useContext(AppContext);

  const [filter, setFilter] = useState("All");
  const printRef = useRef();

  // Fetch user orders on load
  useEffect(() => {
    if (studentData?._id) {
      fetchOrders(studentData._id);
    }
  }, [studentData]);

  const [showOrderInfo, setShowOrderInfo] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

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

  const filteredOrders = getFilteredOrders(orders, filter);

  const handleCancelOrder = async (order) => {
    if (!cancelReason) {
      alert("Please select a cancellation reason");
      return;
    }

    try {
      await cancelOrder(studentData._id, order._id, cancelReason);
      setShowCancelModal(false);
      setCancelReason("");
      setSelectedOrder(null);
      fetchOrders(studentData._id);
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Failed to cancel order. Please try again.");
    }
  };

  return (
    <div>
      {/* 🏷️Page Title */}
      <p className="pb-3 mt-18 font-medium text-zinc-900 border-b text-center">My Orders</p>

      {/* Top Buttons */}
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
      </div>

      {/* Order Status Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <OrderStatusCard
          title="All Orders"
          count={orders.length}
          bgColor="bg-blue-50"
          icon="📦"
          onClick={() => setFilter("All")}
        />
        <OrderStatusCard
          title="Pending Orders"
          count={orders.filter(order => order.status === "Pending").length}
          bgColor="bg-yellow-50"
          icon="⏳"
          onClick={() => setFilter("Pending")}
        />
        <OrderStatusCard
          title="Shipped Orders"
          count={orders.filter(order => order.status === "Shipped").length}
          bgColor="bg-purple-50"
          icon="🚚"
          onClick={() => setFilter("Shipped")}
        />
        <OrderStatusCard
          title="Completed Orders"
          count={orders.filter(order => order.status === "Delivered" && order.deliveryStatus === "Delivered").length}
          bgColor="bg-green-50"
          icon="✅"
          onClick={() => setFilter("Delivered")}
        />
        <OrderStatusCard
          title="Cancelled Orders"
          count={orders.filter(order => order.status === "Cancelled").length}
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
              {/* Order Details */}
              <div className="flex-1 text-sm text-gray-700">
                <p className="text-lg font-semibold text-gray-900">
                  Order ID: <span className="font-bold">{item.orderId}</span>
                </p>
                <p className="text-xs text-gray-600"><span className="font-medium">Date:</span> {new Date(item.date).toLocaleDateString()}</p>
                <p className="text-xs text-gray-600"><span className="font-medium">Total Price:</span> LKR {item.totalAmount}</p>
                <p className="text-xs text-gray-600"><span className="font-medium">No. of Products:</span> {item.items.length}</p>
                <p className={`text-xs mt-1 font-semibold 
                  ${item.status === "Delivered" ? "text-green-600" :
                    item.status === "Pending" ? "text-yellow-600" :
                    item.status === "Shipped" ? "text-blue-600" :
                    item.status === "Cancelled" ? "text-red-600" : "text-gray-600"
                  }`}>
                  Status: {item.status}
                </p>
                <p className={`text-xs mt-1 font-semibold 
                  ${item.deliveryStatus === "Delivered" ? "text-green-600" :
                    item.deliveryStatus === "Assigned" ? "text-blue-600" :
                    "text-gray-600"
                  }`}>
                  Delivery: {item.deliveryStatus}
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
                                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                                        
                                        * {
                                            margin: 0;
                                            padding: 0;
                                            box-sizing: border-box;
                                        }
                                        
                                        body {
                                            font-family: 'Inter', Arial, sans-serif;
                                            color: #34495e;
                                            line-height: 1.5;
                                            padding: 0;
                                            margin: 0;
                                        }
                                        
                                        .invoice-container {
                                            max-width: 800px;
                                            margin: 0 auto;
                                            padding: 20px;
                                        }
                                        
                                        .header {
                                            background-color: #2c3e50;
                                            color: white;
                                            padding: 20px;
                                            display: flex;
                                            justify-content: space-between;
                                            align-items: center;
                                        }
                                        
                                        .header h1 {
                                            font-size: 24px;
                                            font-weight: 700;
                                        }
                                        
                                        .header .invoice-number {
                                            font-size: 16px;
                                            opacity: 0.9;
                                        }
                                        
                                        .invoice-details {
                                            display: grid;
                                            grid-template-columns: repeat(2, 1fr);
                                            gap: 20px;
                                            margin: 20px 0;
                                            padding: 20px;
                                            background-color: #f8f9fa;
                                            border-radius: 8px;
                                        }
                                        
                                        .section {
                                            margin-bottom: 20px;
                                        }
                                        
                                        .section-title {
                                            font-size: 16px;
                                            font-weight: 600;
                                            color: #2c3e50;
                                            margin-bottom: 10px;
                                            padding-bottom: 5px;
                                            border-bottom: 2px solid #e9ecef;
                                        }
                                        
                                        .info-row {
                                            display: flex;
                                            justify-content: space-between;
                                            margin-bottom: 8px;
                                            font-size: 14px;
                                        }
                                        
                                        .info-label {
                                            color: #6c757d;
                                        }
                                        
                                        .info-value {
                                            font-weight: 500;
                                        }
                                        
                                        .items-table {
                                            width: 100%;
                                            border-collapse: collapse;
                                            margin: 20px 0;
                                        }
                                        
                                        .items-table th {
                                            background-color: #f8f9fa;
                                            padding: 10px;
                                            text-align: left;
                                            font-weight: 600;
                                            color: #2c3e50;
                                            border-bottom: 2px solid #e9ecef;
                                        }
                                        
                                        .items-table td {
                                            padding: 10px;
                                            border-bottom: 1px solid #e9ecef;
                                        }
                                        
                                        .items-table tr:nth-child(even) {
                                            background-color: #f8f9fa;
                                        }
                                        
                                        .total-section {
                                            margin-top: 20px;
                                            padding: 20px;
                                            background-color: #f8f9fa;
                                            border-radius: 8px;
                                        }
                                        
                                        .total-row {
                                            display: flex;
                                            justify-content: space-between;
                                            margin-bottom: 10px;
                                            font-size: 14px;
                                        }
                                        
                                        .total-row:last-child {
                                            font-weight: 700;
                                            font-size: 16px;
                                            color: #2c3e50;
                                            border-top: 2px solid #e9ecef;
                                            padding-top: 10px;
                                            margin-top: 10px;
                                        }
                                        
                                        .footer {
                                            margin-top: 30px;
                                            padding: 20px;
                                            text-align: center;
                                            font-size: 12px;
                                            color: #6c757d;
                                            border-top: 1px solid #e9ecef;
                                        }
                                        
                                        @media print {
                                            body {
                                                -webkit-print-color-adjust: exact;
                                                print-color-adjust: exact;
                                            }
                                        }
                                    </style>
                                </head>
                                <body>
                                    <div class="invoice-container">
                                        <div class="header">
                                            <h1>Mind Matters</h1>
                                            <div class="invoice-number">Invoice #${item.orderId}</div>
                                        </div>
                                        
                                        <div class="invoice-details">
                                            <div class="section">
                                                <div class="section-title">Order Details</div>
                                                <div class="info-row">
                                                    <span class="info-label">Order Date:</span>
                                                    <span class="info-value">${new Date(item.date).toLocaleString()}</span>
                                                </div>
                                                <div class="info-row">
                                                    <span class="info-label">Status:</span>
                                                    <span class="info-value">${item.status}</span>
                                                </div>
                                            </div>
                                            
                                            <div class="section">
                                                <div class="section-title">Bill To</div>
                                                <div class="info-row">
                                                    <span class="info-label">Name:</span>
                                                    <span class="info-value">${item.shippingInfo.firstName} ${item.shippingInfo.lastName}</span>
                                                </div>
                                                <div class="info-row">
                                                    <span class="info-label">Email:</span>
                                                    <span class="info-value">${item.shippingInfo.email}</span>
                                                </div>
                                                <div class="info-row">
                                                    <span class="info-label">Phone:</span>
                                                    <span class="info-value">${item.shippingInfo.phone}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div class="section">
                                            <div class="section-title">Shipping Address</div>
                                            <div style="margin-top: 10px;">
                                                ${item.shippingInfo.address}<br>
                                                ${item.shippingInfo.apartment ? item.shippingInfo.apartment + '<br>' : ''}
                                                ${item.shippingInfo.city}, ${item.shippingInfo.district}<br>
                                                ${item.shippingInfo.postalCode}, ${item.shippingInfo.country}
                                            </div>
                                        </div>
                                        
                                        <div class="section">
                                            <div class="section-title">Order Items</div>
                                            <table class="items-table">
                                                <thead>
                                                    <tr>
                                                        <th>Item</th>
                                                        <th>Attributes</th>
                                                        <th>Qty</th>
                                                        <th>Price</th>
                                                        <th>Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    ${item.items.map(item => `
                                                        <tr>
                                                            <td>${item.name}</td>
                                                            <td>${[item.color ? `Color: ${item.color}` : '', item.size ? `Size: ${item.size}` : ''].filter(Boolean).join(', ')}</td>
                                                            <td>${item.quantity}</td>
                                                            <td>LKR ${item.price.toFixed(2)}</td>
                                                            <td>LKR ${(item.price * item.quantity).toFixed(2)}</td>
                                                        </tr>
                                                    `).join('')}
                                                </tbody>
                                            </table>
                                        </div>
                                        
                                        <div class="total-section">
                                            <div class="total-row">
                                                <span>Subtotal:</span>
                                                <span>LKR ${(item.totalAmount - item.shippingCost).toFixed(2)}</span>
                                            </div>
                                            <div class="total-row">
                                                <span>Shipping Cost:</span>
                                                <span>LKR ${item.shippingCost.toFixed(2)}</span>
                                            </div>
                                            <div class="total-row">
                                                <span>Total Amount:</span>
                                                <span>LKR ${item.totalAmount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        
                                        <div class="footer">
                                            <p>Thank you for shopping with Mind Matters!</p>
                                            <p>For any queries, please contact our support team.</p>
                                            <p>This is a computer-generated invoice. No signature required.</p>
                                        </div>
                                    </div>
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

                {item.status === "Pending" && (
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
    </div>
  );
};



export default MyOrders;