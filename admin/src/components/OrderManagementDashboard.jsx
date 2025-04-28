import React, { useState } from 'react';
import OrderStatusCard from './OrderStatusCard';
import { FaSearch, FaTasks, FaTruck, FaChartLine } from 'react-icons/fa';

const OrderManagementDashboard = ({ 
  orders, 
  onOrderOverviewClick,
  onStatusControlClick,
  onDeliveryAssignmentClick,
  onAnalyticsClick
}) => {
  const [activeCard, setActiveCard] = useState(null);

  const handleCardClick = (cardId) => {
    setActiveCard(cardId);
    switch (cardId) {
      case 'overview':
        onOrderOverviewClick();
        break;
      case 'status':
        onStatusControlClick();
        break;
      case 'delivery':
        onDeliveryAssignmentClick();
        break;
      case 'analytics':
        onAnalyticsClick();
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800"></h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <OrderStatusCard
          title="Order Analytics & Insights"
          count={null}
          description="View order trends and performance metrics"
          bgColor="bg-gradient-to-br from-red-50 to-red-100"
          icon={<FaChartLine className="text-red-500 text-2xl" />}
          onClick={() => handleCardClick('analytics')}
          isActive={activeCard === 'analytics'}
        />
        <OrderStatusCard
          title="Order Overview & Search"
          count={orders.length}
          description="Search and filter orders by various criteria"
          bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
          icon={<FaSearch className="text-blue-500 text-2xl" />}
          onClick={() => handleCardClick('overview')}
          isActive={activeCard === 'overview'}
        />

        <OrderStatusCard
          title="Order Status Control & Actions"
          count={orders.length}
          description="Update order statuses and manage processing"
          bgColor="bg-gradient-to-br from-green-50 to-green-100"
          icon={<FaTasks className="text-green-500 text-2xl" />}
          onClick={() => handleCardClick('status')}
          isActive={activeCard === 'status'}
        />

        <OrderStatusCard
          title="Delivery Assignment & Tracking"
          count={null}
          description="Track and manage order deliveries"
          bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
          icon={<FaTruck className="text-purple-500 text-2xl" />}
          onClick={() => handleCardClick('delivery')}
          isActive={activeCard === 'delivery'}
        />

        
      </div>
    </div>
  );
};

export default OrderManagementDashboard; 