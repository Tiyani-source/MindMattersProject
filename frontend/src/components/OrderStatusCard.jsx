import React from "react";

const OrderStatusCard = ({ title, count, description, bgColor, icon, onClick }) => {
  return (
    <div 
      className={`p-4 rounded-lg shadow-md cursor-pointer flex flex-col items-start gap-4 ${bgColor}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="p-2 bg-white rounded-full">{icon}</div>
        <div>
          <p className="text-gray-600 font-semibold">{title}</p>
          {/* ✅ Only display count if it's not null */}
          {count !== null && <h3 className="font-bold text-lg">{count} Orders</h3>}
        </div>
      </div>
      {/* ✅ New Description Field */}
      {description && <p className="text-gray-500 text-sm">{description}</p>}
    </div>
  );
};

export default OrderStatusCard;