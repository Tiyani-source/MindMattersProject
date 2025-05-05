import React, { useEffect } from 'react';
import { Download, X } from 'lucide-react';

const DeliveryPartnersReport = ({ reportData, onDownload, onClose }) => {
  useEffect(() => {
    console.log('Report component mounted with data:', reportData);
  }, [reportData]);

  if (!reportData) {
    console.error('No report data provided');
    return null;
  }

  // Simple bar chart using divs
  const SimpleBarChart = ({ data, title, color = 'blue' }) => {
    const maxValue = Math.max(...Object.values(data));
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500'
    };
    
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">{title}</h4>
        <div className="space-y-2">
          {Object.entries(data).map(([label, value]) => (
            <div key={label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">{label}</span>
                <span className="text-gray-900">{value}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${colorClasses[color]} rounded-full transition-all duration-500`}
                  style={{ width: `${(value / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Enhanced ProvinceBarChart: horizontal bars, axis, grid, tooltip, highlight
  const ProvinceBarChart = ({ data, title, color = 'blue' }) => {
    const [hovered, setHovered] = React.useState(null);
    const maxValue = Math.max(...Object.values(data));
    const colorClasses = {
      blue: 'bg-blue-500',
      blueHighlight: 'bg-blue-700',
    };
    const barHeight = 28;
    const barGap = 18;
    const barCount = Object.keys(data).length;
    const chartHeight = barCount * (barHeight + barGap);
    const gridStep = Math.ceil(maxValue / 5);
    const gridLines = Array.from({ length: 6 }, (_, i) => i * gridStep);

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>
        <div className="relative" style={{ height: chartHeight + 40 }}>
          {/* Grid lines */}
          <div className="absolute left-36 right-4 top-0 bottom-8 z-0">
            {gridLines.map((val, i) => (
              <div
                key={val}
                className="absolute border-t border-gray-200"
                style={{
                  left: `${(val / maxValue) * 100}%`,
                  top: 0,
                  width: 1,
                  height: '100%',
                  borderLeft: '1px solid #e5e7eb',
                  borderTop: 'none',
                  zIndex: 0,
                }}
              >
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-400">{val}</span>
              </div>
            ))}
          </div>
          {/* Bars and labels */}
          <div className="absolute left-0 right-0 top-0 z-10">
            {Object.entries(data).map(([label, value], idx) => (
              <div key={label} style={{ height: barHeight, marginBottom: barGap, display: 'flex', alignItems: 'center' }}>
                {/* Y-axis label */}
                <div className="w-36 text-right pr-4 text-sm text-gray-600" style={{ flexShrink: 0 }}>{label}</div>
                {/* Bar */}
                <div className="flex-1 relative">
                  <div
                    className={`h-6 rounded transition-all duration-300 cursor-pointer ${hovered === idx ? colorClasses.blueHighlight : colorClasses.blue}`}
                    style={{ width: `${(value / maxValue) * 100}%` }}
                    onMouseEnter={() => setHovered(idx)}
                    onMouseLeave={() => setHovered(null)}
                  />
                  {/* Tooltip */}
                  {hovered === idx && (
                    <div className="absolute left-1/2 -top-8 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg z-20 whitespace-nowrap">
                      {label}: {value}
                    </div>
                  )}
                </div>
                {/* Value at end of bar */}
                <div className="w-10 text-xs text-gray-700 pl-2">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Simple pie chart using a single conic-gradient div
  const SimplePieChart = ({ data }) => {
    // Only deliveries for the center total
    const totalDeliveries = (data['Active Deliveries'] || 0) + (data['Completed Deliveries'] || 0);
    let lastAngle = 0;
    const segments = Object.entries(data).map(([label, value], index) => {
      const percentage = (value / Object.values(data).reduce((sum, v) => sum + v, 0)) * 100;
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

    // Build the conic-gradient string
    const gradient = segments.map((seg, i) => {
      return `${seg.color} ${seg.start}deg ${seg.end}deg`;
    }).join(', ');

    return (
      <div className="relative w-48 h-48 mx-auto mb-4">
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: `conic-gradient(${gradient})` }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-gray-900">{totalDeliveries}</div>
          <div className="text-sm text-gray-600">Total Deliveries</div>
        </div>
      </div>
    );
  };

  // Helper function to get colors for pie chart
  const getColor = (index) => {
    const colors = [
      'rgb(59, 130, 246)', // blue
      'rgb(16, 185, 129)', // green
      'rgb(245, 158, 11)', // yellow
      'rgb(139, 92, 246)'  // purple
    ];
    return colors[index % colors.length];
  };

  // Prepare performance data for the chart
  const preparePerformanceData = () => {
    const data = {};
    reportData.performanceMetrics.forEach(metric => {
      data[metric.name] = metric.totalDeliveries;
    });
    return data;
  };

  // Prepare summary data for pie chart using actual backend data
  const prepareSummaryData = () => {
    // Calculate total deliveries (active + completed)
    const totalDeliveries = reportData.activeDeliveries + reportData.completedDeliveries;
    
    return {
      'Available Partners': reportData.availablePartners,
      'Active Deliveries': reportData.activeDeliveries,
      'Completed Deliveries': reportData.completedDeliveries,
      'Unavailable Partners': reportData.totalPartners - reportData.availablePartners
    };
  };

  // Simple Line Chart for Performance Metrics
  const PerformanceLineChart = ({ data, title }) => {
    const entries = Object.entries(data);
    const values = entries.map(([, v]) => v);
    const labels = entries.map(([k]) => k);
    const maxValue = Math.max(...values, 1);
    const minValue = Math.min(...values, 0);
    const chartWidth = 400;
    const chartHeight = 180;
    const padding = 40;
    const pointRadius = 4;
    const stepX = (chartWidth - 2 * padding) / (values.length - 1 || 1);
    const scaleY = v => chartHeight - padding - ((v - minValue) / (maxValue - minValue || 1)) * (chartHeight - 2 * padding);
    const scaleX = i => padding + i * stepX;
    const linePath = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${scaleX(i)},${scaleY(v)}`).join(' ');
    const gridCount = 4;
    const gridVals = Array.from({ length: gridCount + 1 }, (_, i) => minValue + (i * (maxValue - minValue) / gridCount));

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>
        <svg width={chartWidth} height={chartHeight + 30} className="block w-full h-auto">
          {/* Grid lines and Y labels */}
          {gridVals.map((v, i) => (
            <g key={i}>
              <line
                x1={padding}
                x2={chartWidth - padding}
                y1={scaleY(v)}
                y2={scaleY(v)}
                stroke="#f3f4f6"
                strokeWidth={1}
              />
              <text
                x={padding - 8}
                y={scaleY(v) + 4}
                fontSize={12}
                fill="#a3a3a3"
                textAnchor="end"
              >
                {Math.round(v)}
              </text>
            </g>
          ))}
          {/* X labels, rotated 45deg with tooltip */}
          {labels.map((label, i) => (
            <g key={label}>
              <title>{label}</title>
              <text
                x={scaleX(i)}
                y={chartHeight - padding + 28}
                fontSize={12}
                fill="#6b7280"
                textAnchor="end"
                transform={`rotate(-45,${scaleX(i)},${chartHeight - padding + 18})`}
                style={{ cursor: 'pointer' }}
              >
                {label.length > 10 ? label.slice(0, 10) + '…' : label}
              </text>
            </g>
          ))}
          {/* Line path */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth={4}
            points={values.map((v, i) => `${scaleX(i)},${scaleY(v)}`).join(' ')}
          />
          {/* Points */}
          {values.map((v, i) => (
            <circle
              key={i}
              cx={scaleX(i)}
              cy={scaleY(v)}
              r={pointRadius}
              fill="#3b82f6"
              stroke="#fff"
              strokeWidth={2}
            />
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Side Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold text-gray-900">Delivery Partners Report</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Summary Pie Chart */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Delivery Partners Overview</h3>
              <SimplePieChart data={prepareSummaryData()} />
              <div className="grid grid-cols-2 gap-4 mt-4">
                {Object.entries(prepareSummaryData()).map(([label, value], index) => (
                  <div key={label} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: getColor(index) }}
                    />
                    <span className="text-sm text-gray-600">{label}: {value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Province Distribution */}
            <div className="bg-white p-4 rounded-lg border">
              <ProvinceBarChart 
                data={reportData.provinceDistribution} 
                title="Province Distribution"
                color="blue"
              />
            </div>

            {/* Vehicle Type Distribution */}
            <div className="bg-white p-4 rounded-lg border">
              <SimpleBarChart 
                data={reportData.vehicleTypeDistribution} 
                title="Vehicle Type Distribution"
                color="green"
              />
            </div>

            {/* Performance Metrics */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
              <PerformanceLineChart 
                data={preparePerformanceData()} 
                title="Total Deliveries by Partner"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t">
            <button
              onClick={onDownload}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={18} />
              Download Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPartnersReport; 