import React, { useState } from "react";

const OrderStatusCard = ({ title, count, description, bgColor, icon, onClick, isActive }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`
        p-6 rounded-xl shadow-lg cursor-pointer 
        transition-all duration-300 ease-in-out
        transform hover:scale-[1.02] hover:shadow-xl
        ${isActive ? 'ring-2 ring-offset-2 ring-blue-500' : ''}
        ${bgColor}
      `}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-4">
        <div className={`
          p-3 rounded-full transition-all duration-300
          ${isHovered || isActive ? 'bg-white scale-110' : 'bg-white/80'}
        `}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-gray-700 font-semibold text-lg">{title}</p>
          {/* Only display count if it's not null */}
          {count !== null && (
            <h3 className="font-bold text-2xl mt-1">
              {count} <span className="text-sm font-normal">Orders</span>
            </h3>
          )}
        </div>
      </div>
      {/* New Description Field */}
      {description && (
        <p className="text-gray-600 text-sm mt-3">
          {description}
        </p>
      )}
      <div className={`
        mt-4 h-1 w-full rounded-full
        transition-all duration-300
        ${isHovered || isActive ? 'bg-blue-500' : 'bg-transparent'}
      `} />
    </div>
  );
};

export default OrderStatusCard;