import React, { useContext, useEffect, useRef,useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import OrderStatusCard from '../components/OrderStatusCard';
import OrderInfo from '../components/OrderInfo';

const MyOrders = () => {
  const navigate = useNavigate();
  const {
    userData,
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
    if (userData?._id) {
      fetchOrders(userData._id);
    }
  }, [userData]);

  const [showOrderInfo, setShowOrderInfo] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);



  const filteredOrders = getFilteredOrders(orders, filter);

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
          count={orders.filter(order => order.status === "Delivered").length}
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