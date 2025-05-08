import React from 'react';
import { FaBox, FaTruck, FaUser, FaShoppingCart, FaTimes, FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';

const OrderInfo = ({ selectedOrder, setShowOrderInfo, isPrintMode = false }) => {
  if (!selectedOrder) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered':
        return <FaCheckCircle className="text-green-500" />;
      case 'Pending':
        return <FaClock className="text-yellow-500" />;
      case 'Shipped':
        return <FaTruck className="text-blue-500" />;
      default:
        return <FaExclamationTriangle className="text-red-500" />;
    }
  };

  const getDeliveryStatusIcon = (deliveryStatus) => {
    switch (deliveryStatus) {
      case 'Delivered':
        return <FaCheckCircle className="text-green-500" />;
      case 'Assigned':
        return <FaTruck className="text-blue-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  return (
    <div className={`${isPrintMode ? "" : "fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50"}`}>
      <div className={`bg-white rounded-2xl shadow-2xl w-[100%] max-w-10xl mx-auto ${isPrintMode ? "" : "max-h-[90vh] overflow-y-auto"}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 rounded-t-2xl p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-xl">
                <FaBox className="text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Order Summary</h2>
                <p className="text-blue-100">Order #{selectedOrder.orderId}</p>
              </div>
            </div>
            {!isPrintMode && (
              <button
                onClick={() => setShowOrderInfo(false)}
                className="text-white hover:text-blue-200 transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <FaTimes size={20} />
              </button>
            )}
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Top Section: Order Details, Delivery Status, Shipping Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Order Details Card */}
            <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100 flex flex-col justify-between min-h-[200px]">
              <div className="flex items-center gap-3 mb-4">
                <FaBox className="text-indigo-600 text-xl" />
                <h3 className="text-lg font-semibold text-gray-800">Order Details</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Order Date</span>
                  <span className="font-medium">{formatDate(selectedOrder.date)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Items</span>
                  <span className="font-medium">{selectedOrder.products}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Shipping Cost</span>
                  <span className="font-medium text-indigo-600">LKR {selectedOrder.shippingCost}</span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="text-gray-600 font-semibold">Total Amount</span>
                  <span className="font-bold text-indigo-600">LKR {selectedOrder.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Delivery Status Card */}
            <div className="bg-green-50 rounded-xl p-6 border border-green-100 flex flex-col justify-between min-h-[200px]">
              <div className="flex items-center gap-3 mb-4">
                {getStatusIcon(selectedOrder.status)}
                <h3 className="text-lg font-semibold text-gray-800">Order Status</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium px-2 py-1 rounded ${
                    selectedOrder.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                    selectedOrder.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                    selectedOrder.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  {getDeliveryStatusIcon(selectedOrder.deliveryStatus)}
                  <h3 className="text-lg font-semibold text-gray-800">Delivery Status</h3>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium px-2 py-1 rounded ${
                    selectedOrder.deliveryStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                    selectedOrder.deliveryStatus === 'Assigned' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedOrder.deliveryStatus}
                  </span>
                </div>
                {selectedOrder.deliveryPartner && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Delivery Partner</span>
                      <span className="font-medium">{selectedOrder.deliveryPartner.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Phone</span>
                      <span className="font-medium">{selectedOrder.deliveryPartner.phone}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Vehicle</span>
                      <span className="font-medium">{selectedOrder.deliveryPartner.vehicleNumber}</span>
                    </div>
                  </div>
                )}
                {selectedOrder.estimatedDelivery && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Estimated Delivery</span>
                    <span className="font-medium">{formatDate(selectedOrder.estimatedDelivery)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Information Card */}
            <div className="bg-pink-50 rounded-xl p-6 border border-pink-100 flex flex-col justify-between min-h-[200px]">
              <div className="flex items-center gap-3 mb-4">
                <FaUser className="text-purple-600 text-xl" />
                <h3 className="text-lg font-semibold text-gray-800">Shipping Information</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600 block">Name</span>
                  <span className="font-medium block">{selectedOrder.shippingInfo.firstName} {selectedOrder.shippingInfo.lastName}</span>
                </div>
                <div>
                  <span className="text-gray-600 block">Email</span>
                  <span className="font-medium block break-all">{selectedOrder.shippingInfo.email}</span>
                </div>
                <div>
                  <span className="text-gray-600 block">Phone</span>
                  <span className="font-medium block">{selectedOrder.shippingInfo.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Address and Order Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Address Card */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 flex flex-col min-h-[180px]">
              <div className="flex items-center gap-3 mb-4">
                <FaUser className="text-blue-600 text-xl" />
                <h3 className="text-lg font-semibold text-gray-800">Delivery Address</h3>
              </div>
              <div className="text-sm space-y-1 bg-white rounded-lg p-4 border border-blue-100">
                <p className="font-medium">{selectedOrder.shippingInfo.address}</p>
                {selectedOrder.shippingInfo.apartment && (
                  <p className="font-medium">{selectedOrder.shippingInfo.apartment}</p>
                )}
                <p className="font-medium">{selectedOrder.shippingInfo.city}, {selectedOrder.shippingInfo.district}</p>
                <p className="font-medium">{selectedOrder.shippingInfo.postalCode}, {selectedOrder.shippingInfo.country}</p>
              </div>
            </div>

            {/* Order Items Card */}
            <div className="bg-amber-50 rounded-xl p-6 border border-amber-100 flex flex-col min-h-[180px]">
              <div className="flex items-center gap-3 mb-4">
                <FaShoppingCart className="text-orange-600 text-xl" />
                <h3 className="text-lg font-semibold text-gray-800">Order Items</h3>
              </div>
              <div className="space-y-3">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white rounded-lg border border-amber-100 p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                        
                          <FaBox className="text-orange-400" />
                        
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{item.name}</h4>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                          <p>Quantity: {item.quantity}</p>
                          {item.color && (
                            <div className="flex items-center gap-1">
                              <span>|</span>
                              <span>Color:</span>
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                            </div>
                          )}
                          {item.size && (
                            <div className="flex items-center gap-1">
                              <span>|</span>
                              <span>Size: {item.size}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="font-semibold text-orange-600 text-sm whitespace-nowrap">LKR {item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderInfo;