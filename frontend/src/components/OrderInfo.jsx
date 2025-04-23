import React from 'react';
import { FaBox, FaTruck, FaUser, FaShoppingCart, FaTimes } from 'react-icons/fa';

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

  return (
    <div className={`${isPrintMode ? "" : "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"}`}>
      <div className={`bg-white rounded-xl shadow-xl w-[95%] max-w-2xl mx-auto ${isPrintMode ? "" : "max-h-[90vh] overflow-y-auto"}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Order Summary</h2>
              <p className="text-blue-100 mt-1">Order #{selectedOrder.orderId}</p>
            </div>
            {!isPrintMode && (
              <button
                onClick={() => setShowOrderInfo(false)}
                className="text-white hover:text-blue-200 transition-colors"
              >
                <FaTimes size={24} />
              </button>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <FaBox className="text-blue-500 text-xl" />
                <h3 className="text-lg font-semibold text-gray-800">Order Details</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between">
                  <span className="text-gray-600">Order Date:</span>
                  <span className="font-medium">{formatDate(selectedOrder.date)}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-medium">{selectedOrder.products}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-bold text-blue-600">LKR {selectedOrder.totalAmount}</span>
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <FaTruck className="text-green-500 text-xl" />
                <h3 className="text-lg font-semibold text-gray-800">Delivery Status</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${
                    selectedOrder.status === 'Delivered' ? 'text-green-600' :
                    selectedOrder.status === 'Pending' ? 'text-yellow-600' :
                    selectedOrder.status === 'Shipped' ? 'text-blue-600' :
                    'text-red-600'
                  }`}>
                    {selectedOrder.status}
                  </span>
                </p>
                {selectedOrder.deliveryPartner && (
                  <p className="flex justify-between">
                    <span className="text-gray-600">Delivery Partner:</span>
                    <span className="font-medium">{selectedOrder.deliveryPartner}</span>
                  </p>
                )}
                {selectedOrder.estimatedDelivery && (
                  <p className="flex justify-between">
                    <span className="text-gray-600">Estimated Delivery:</span>
                    <span className="font-medium">{formatDate(selectedOrder.estimatedDelivery)}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <FaUser className="text-purple-500 text-xl" />
              <h3 className="text-lg font-semibold text-gray-800">Shipping Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Name</p>
                <p className="font-medium">{selectedOrder.shippingInfo.firstName} {selectedOrder.shippingInfo.lastName}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Email</p>
                <p className="font-medium">{selectedOrder.shippingInfo.email}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Phone</p>
                <p className="font-medium">{selectedOrder.shippingInfo.phone}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Address</p>
                <p className="font-medium">{selectedOrder.shippingInfo.address}</p>
                {selectedOrder.shippingInfo.apartment && (
                  <p className="font-medium">{selectedOrder.shippingInfo.apartment}</p>
                )}
              </div>
              <div>
                <p className="text-gray-600 mb-1">City</p>
                <p className="font-medium">{selectedOrder.shippingInfo.city}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">District</p>
                <p className="font-medium">{selectedOrder.shippingInfo.district}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Postal Code</p>
                <p className="font-medium">{selectedOrder.shippingInfo.postalCode}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Country</p>
                <p className="font-medium">{selectedOrder.shippingInfo.country}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <FaShoppingCart className="text-orange-500 text-xl" />
              <h3 className="text-lg font-semibold text-gray-800">Order Items</h3>
            </div>
            <div className="space-y-4">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <FaBox className="text-gray-400 text-xl" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{item.name}</h4>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-800">LKR {item.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderInfo;