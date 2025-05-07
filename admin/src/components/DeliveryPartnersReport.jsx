import React, { useEffect } from 'react';
import { Download, X, TrendingUp, Users, Package, Clock, Star } from 'lucide-react';

const DeliveryPartnersReport = ({ reportData, onDownload, onClose }) => {
  useEffect(() => {
    console.log('Report component mounted with data:', reportData);
  }, [reportData]);

  if (!reportData) {
    console.error('No report data provided');
    return null;
  }

  // Enhanced ProvinceBarChart with more metrics and better styling
  const ProvinceBarChart = ({ data, title, color = 'blue' }) => {
    const [hovered, setHovered] = React.useState(null);
    const maxValue = Math.max(...Object.values(data));
    const total = Object.values(data).reduce((a, b) => a + b, 0);
    const colorClasses = {
      blue: 'bg-blue-500',
      blueHighlight: 'bg-blue-700',
    };
    const barHeight = 24;
    const barGap = 12;
    const barCount = Object.keys(data).length;
    const chartHeight = barCount * (barHeight + barGap);

    // Sort data by value in descending order
    const sortedData = Object.entries(data).sort(([, a], [, b]) => b - a);

    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
            <p className="text-xs text-gray-500">Geographic distribution</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">{total}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
        </div>

        <div className="relative" style={{ height: chartHeight + 20 }}>
          {/* Bars and labels */}
          <div className="absolute left-0 right-0 top-0 z-10">
            {sortedData.map(([label, value], idx) => {
              const percentage = ((value / total) * 100).toFixed(1);
              return (
                <div key={label} style={{ height: barHeight, marginBottom: barGap, display: 'flex', alignItems: 'center' }}>
                  {/* Y-axis label */}
                  <div className="w-32 text-right pr-3" style={{ flexShrink: 0 }}>
                    <div className="text-xs font-medium text-gray-700 truncate" title={label}>{label}</div>
                    <div className="text-xs text-gray-500">{percentage}%</div>
                  </div>
                  {/* Bar */}
                  <div className="flex-1 relative">
                    <div
                      className={`h-5 rounded transition-all duration-300 cursor-pointer ${
                        hovered === idx ? colorClasses.blueHighlight : colorClasses.blue
                      }`}
                      style={{ 
                        width: `${(value / maxValue) * 100}%`,
                        boxShadow: hovered === idx ? '0 2px 4px -1px rgba(0, 0, 0, 0.1)' : 'none'
                      }}
                      onMouseEnter={() => setHovered(idx)}
                      onMouseLeave={() => setHovered(null)}
                    />
                    {/* Tooltip */}
                    {hovered === idx && (
                      <div className="absolute left-1/2 -top-8 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg z-20 whitespace-nowrap">
                        <div className="font-medium">{label}</div>
                        <div className="text-gray-300">
                          {value} partners ({percentage}%)
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Value at end of bar */}
                  <div className="w-12 text-right">
                    <div className="text-xs font-semibold text-gray-900">{value}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional Stats */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between">
            <div className="text-xs">
              <span className="text-gray-500">Most Active: </span>
              <span className="font-medium text-gray-700">{sortedData[0]?.[0]}</span>
            </div>
            <div className="text-xs">
              <span className="text-gray-500">Coverage: </span>
              <span className="font-medium text-gray-700">{sortedData.length} Provinces</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Pie Chart with better styling and more information
  const EnhancedPieChart = ({ data, title }) => {
    const total = Object.values(data).reduce((sum, v) => sum + v, 0);
    let lastAngle = 0;
    const segments = Object.entries(data).map(([label, value], index) => {
      const percentage = (value / total) * 100;
      const angle = (percentage / 100) * 360;
      const start = lastAngle;
      const end = lastAngle + angle;
      lastAngle = end;
      return {
        color: getColor(index),
        start,
        end,
        percentage,
        label,
        value
      };
    });

    const gradient = segments.map((seg, i) => {
      return `${seg.color} ${seg.start}deg ${seg.end}deg`;
    }).join(', ');

    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
            <p className="text-xs text-gray-500 mt-1">Distribution of delivery partners by status</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* Pie Chart */}
          <div className="relative w-48 h-48">
            <div
              className="absolute inset-0 rounded-full shadow-inner transform transition-transform duration-500 hover:scale-105"
              style={{ 
                background: `conic-gradient(${gradient})`,
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)'
              }}
            />
          </div>

          {/* Legend with enhanced styling */}
          <div className="flex-1 ml-8 space-y-4">
            {segments.map((seg, i) => (
              <div key={seg.label} className="flex items-center group">
                <div 
                  className="w-4 h-4 rounded-full mr-3 transition-transform duration-300 group-hover:scale-125"
                  style={{ backgroundColor: seg.color }}
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{seg.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{seg.value}</span>
                  </div>
                  <div className="mt-1">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${seg.percentage}%`,
                          backgroundColor: seg.color,
                          opacity: 0.8
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">Percentage</span>
                      <span className="text-xs font-medium text-gray-700">{seg.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Stats */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Available Rate</div>
              <div className="text-lg font-semibold text-gray-900">
                {((data['Available Partners'] / total) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Delivery Efficiency</div>
              <div className="text-lg font-semibold text-gray-900">
                {((data['Completed Deliveries'] / (data['Active Deliveries'] + data['Completed Deliveries'])) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Performance Metrics Chart
  const PerformanceMetricsChart = ({ data }) => {
    const metrics = data.map(metric => ({
      name: metric.name,
      totalDeliveries: metric.totalDeliveries,
      activeDeliveries: metric.activeDeliveries,
      completedDeliveries: metric.completedDeliveries,
      rating: metric.rating
    }));

    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-4">Performance Metrics</h4>
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-700">{metric.name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Rating:</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={star <= metric.rating ? "text-yellow-400 fill-current" : "text-gray-300"}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="text-sm font-medium text-blue-700">{metric.totalDeliveries}</div>
                  <div className="text-xs text-blue-500">Total</div>
                </div>
                <div className="text-center p-2 bg-yellow-50 rounded">
                  <div className="text-sm font-medium text-yellow-700">{metric.activeDeliveries}</div>
                  <div className="text-xs text-yellow-500">Active</div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="text-sm font-medium text-green-700">{metric.completedDeliveries}</div>
                  <div className="text-xs text-green-500">Completed</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Helper function to get colors for charts
  const getColor = (index) => {
    const colors = [
      'rgb(59, 130, 246)', // blue
      'rgb(16, 185, 129)', // green
      'rgb(245, 158, 11)', // yellow
      'rgb(139, 92, 246)', // purple
      'rgb(239, 68, 68)',  // red
      'rgb(14, 165, 233)'  // sky
    ];
    return colors[index % colors.length];
  };

  // Prepare summary data for pie chart
  const prepareSummaryData = () => {
    return {
      'Available Partners': reportData.availablePartners,
      'Active Deliveries': reportData.activeDeliveries,
      'Completed Deliveries': reportData.completedDeliveries,
      'Unavailable Partners': reportData.totalPartners - reportData.availablePartners
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Delivery Partners Report</h2>
            <div className="flex space-x-2">
              <button
                onClick={onDownload}
                className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <Download size={16} className="mr-2" />
                Download Report
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-full">
                  <Users size={20} className="text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Partners</div>
                  <div className="text-xl font-semibold text-gray-800">{reportData.totalPartners}</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 rounded-full">
                  <Package size={20} className="text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Active Deliveries</div>
                  <div className="text-xl font-semibold text-gray-800">{reportData.activeDeliveries}</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-50 rounded-full">
                  <Clock size={20} className="text-yellow-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Completed Deliveries</div>
                  <div className="text-xl font-semibold text-gray-800">{reportData.completedDeliveries}</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-50 rounded-full">
                  <TrendingUp size={20} className="text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Available Partners</div>
                  <div className="text-xl font-semibold text-gray-800">{reportData.availablePartners}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-2 gap-6">
            <ProvinceBarChart
              data={reportData.provinceDistribution}
              title="Partner Distribution by Province"
            />
            <EnhancedPieChart
              data={prepareSummaryData()}
              title="Partner Status Distribution"
            />
            <div className="col-span-2">
              <PerformanceMetricsChart data={reportData.performanceMetrics} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPartnersReport; 