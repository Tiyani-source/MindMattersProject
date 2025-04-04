const OrderInfo = ({ selectedOrder, setShowOrderInfo, isPrintMode = false }) => {
  if (!selectedOrder) return null;

  return (
    <div className={`${isPrintMode ? "" : "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"}`}>
      <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-center border-b pb-2">Order Summary</h2>

        {/* Order Info */}
        <p><strong>Order ID:</strong> {selectedOrder.orderId}</p>
        <p><strong>Date:</strong> {new Date(selectedOrder.date).toLocaleString()}</p>
        <p><strong>No. of Products:</strong> {selectedOrder.products}</p>

        {/* Shipping Info */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Shipping Info</h3>
          <p><strong>Name:</strong> {selectedOrder.shippingInfo.firstName} {selectedOrder.shippingInfo.lastName}</p>
          <p><strong>Email:</strong> {selectedOrder.shippingInfo.email}</p>
          <p><strong>Phone:</strong> {selectedOrder.shippingInfo.phone}</p>
          <p><strong>Address:</strong> {selectedOrder.shippingInfo.address}, {selectedOrder.shippingInfo.apartment}</p>
          <p><strong>City:</strong> {selectedOrder.shippingInfo.city}</p>
          <p><strong>District:</strong> {selectedOrder.shippingInfo.district}</p>
          <p><strong>Postal Code:</strong> {selectedOrder.shippingInfo.postalCode}</p>
          <p><strong>Country:</strong> {selectedOrder.shippingInfo.country}</p>
        </div>

        {/* Items */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Items</h3>
          {selectedOrder.items.map((item, idx) => (
            <div key={idx} className="text-sm mb-2">
              <p><strong>Name:</strong> {item.name}</p>
              <p><strong>Quantity:</strong> {item.quantity}</p>
              <p><strong>Price:</strong> LKR {item.price}</p>
            </div>
          ))}
        </div>

        <p className="mt-4 font-semibold">Total Amount: LKR {selectedOrder.totalAmount}</p>

        {!isPrintMode && (
          <button
            className="mt-4 text-sm text-red-600 hover:underline"
            onClick={() => setShowOrderInfo(false)}
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};
export default OrderInfo;