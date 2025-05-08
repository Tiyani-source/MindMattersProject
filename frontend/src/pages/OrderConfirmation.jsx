// src/components/OrderConfirmation.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import OrderInfo from "../components/OrderInfo";

const OrderConfirmation = () => {
  const { state } = useLocation();
  const order = state?.order;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center p-4">
      <div className="w-full max-w-10xl bg-white rounded-2xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left md:w-1/2">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto md:mx-0 mb-4">
              <svg
                className="w-10 h-10 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">Thank You!</h1>
            <p className="text-lg text-gray-700 mb-1">Your order has been placed successfully.</p>
            <p className="text-gray-500 mb-4">
              Payment Status: {order?.paymentStatus || "N/A"}
              {order?.paymentDetails?.cardLast4 &&
                ` (Card ending in ${order.paymentDetails.cardLast4})`}
            </p>
            <p className="text-gray-500 mb-4">Total Amount: LKR {order?.totalAmount || "N/A"}</p>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-600">
                You can view additional details or track the status of your order anytime via the{" "}
                <Link
                  to="/my-orders"
                  className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors duration-200"
                >
                  My Orders
                </Link>{" "}
                section.
              </p>
            </div>
            <div className="mt-4">
              <Link
                to="/store"
                className="inline-block bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200"
              >
                Continue Shopping
              </Link>
            </div>
          </div>

          {order && (
            <div className="md:w-1/2">
              <OrderInfo selectedOrder={order} isPrintMode={true} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;