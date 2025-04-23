import React from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import OrderInfo from "../components/OrderInfo"; 


const OrderConfirmation = () => {
  const { state } = useLocation();
  const order = state?.order;

<OrderInfo selectedOrder={order} isPrintMode={true} />



  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center p-6">
      <h1 className="text-3xl font-bold text-green-600 mb-4">Thank You!</h1>
      <p className="text-lg text-gray-700">Your order has been placed successfully.</p>
      <p className="text-sm text-gray-500 mt-2"> We'll notify you when your order is ready for dispatch. 
        You can view additional details or track the status of your order anytime via the 
        <Link to="/my-orders" className="text-indigo-600 font-medium hover:underline">
        My Orders
        </Link>{" "}
        section.
     </p>

     {order && (
        <div className="mt-6 w-full max-w-xl">
          <OrderInfo selectedOrder={order} isPrintMode={true} />
        </div>
      )}
    </div>
  );
};

export default OrderConfirmation;