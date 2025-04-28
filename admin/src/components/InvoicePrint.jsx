import React from 'react';

const InvoicePrint = ({ order }) => {
    const handlePrint = () => {
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Invoice - ${order.orderId}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                        
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body {
                            font-family: 'Inter', Arial, sans-serif;
                            color: #34495e;
                            line-height: 1.5;
                            padding: 0;
                            margin: 0;
                        }
                        
                        .invoice-container {
                            max-width: 800px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        
                        .header {
                            background-color: #2c3e50;
                            color: white;
                            padding: 20px;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                        }
                        
                        .header h1 {
                            font-size: 24px;
                            font-weight: 700;
                        }
                        
                        .header .invoice-number {
                            font-size: 16px;
                            opacity: 0.9;
                        }
                        
                        .invoice-details {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 20px;
                            margin: 20px 0;
                            padding: 20px;
                            background-color: #f8f9fa;
                            border-radius: 8px;
                        }
                        
                        .section {
                            margin-bottom: 20px;
                        }
                        
                        .section-title {
                            font-size: 16px;
                            font-weight: 600;
                            color: #2c3e50;
                            margin-bottom: 10px;
                            padding-bottom: 5px;
                            border-bottom: 2px solid #e9ecef;
                        }
                        
                        .info-row {
                            display: flex;
                            justify-content: space-between;
                            margin-bottom: 8px;
                            font-size: 14px;
                        }
                        
                        .info-label {
                            color: #6c757d;
                        }
                        
                        .info-value {
                            font-weight: 500;
                        }
                        
                        .items-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 20px 0;
                        }
                        
                        .items-table th {
                            background-color: #f8f9fa;
                            padding: 10px;
                            text-align: left;
                            font-weight: 600;
                            color: #2c3e50;
                            border-bottom: 2px solid #e9ecef;
                        }
                        
                        .items-table td {
                            padding: 10px;
                            border-bottom: 1px solid #e9ecef;
                        }
                        
                        .items-table tr:nth-child(even) {
                            background-color: #f8f9fa;
                        }
                        
                        .total-section {
                            margin-top: 20px;
                            padding: 20px;
                            background-color: #f8f9fa;
                            border-radius: 8px;
                        }
                        
                        .total-row {
                            display: flex;
                            justify-content: space-between;
                            margin-bottom: 10px;
                            font-size: 14px;
                        }
                        
                        .total-row:last-child {
                            font-weight: 700;
                            font-size: 16px;
                            color: #2c3e50;
                            border-top: 2px solid #e9ecef;
                            padding-top: 10px;
                            margin-top: 10px;
                        }
                        
                        .footer {
                            margin-top: 30px;
                            padding: 20px;
                            text-align: center;
                            font-size: 12px;
                            color: #6c757d;
                            border-top: 1px solid #e9ecef;
                        }
                        
                        @media print {
                            body {
                                -webkit-print-color-adjust: exact;
                                print-color-adjust: exact;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="invoice-container">
                        <div class="header">
                            <h1>Mind Matters</h1>
                            <div class="invoice-number">Invoice #${order.orderId}</div>
                        </div>
                        
                        <div class="invoice-details">
                            <div class="section">
                                <div class="section-title">Order Details</div>
                                <div class="info-row">
                                    <span class="info-label">Order Date:</span>
                                    <span class="info-value">${new Date(order.date).toLocaleString()}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Status:</span>
                                    <span class="info-value">${order.status}</span>
                                </div>
                            </div>
                            
                            <div class="section">
                                <div class="section-title">Bill To</div>
                                <div class="info-row">
                                    <span class="info-label">Name:</span>
                                    <span class="info-value">${order.shippingInfo.firstName} ${order.shippingInfo.lastName}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Email:</span>
                                    <span class="info-value">${order.shippingInfo.email}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Phone:</span>
                                    <span class="info-value">${order.shippingInfo.phone}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="section">
                            <div class="section-title">Shipping Address</div>
                            <div style="margin-top: 10px;">
                                ${order.shippingInfo.address}<br>
                                ${order.shippingInfo.apartment ? order.shippingInfo.apartment + '<br>' : ''}
                                ${order.shippingInfo.city}, ${order.shippingInfo.district}<br>
                                ${order.shippingInfo.postalCode}, ${order.shippingInfo.country}
                            </div>
                        </div>
                        
                        <div class="section">
                            <div class="section-title">Order Items</div>
                            <table class="items-table">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Attributes</th>
                                        <th>Qty</th>
                                        <th>Price</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${order.items.map(item => `
                                        <tr>
                                            <td>${item.name}</td>
                                            <td>${[item.color ? `Color: ${item.color}` : '', item.size ? `Size: ${item.size}` : ''].filter(Boolean).join(', ')}</td>
                                            <td>${item.quantity}</td>
                                            <td>LKR ${item.price.toFixed(2)}</td>
                                            <td>LKR ${(item.price * item.quantity).toFixed(2)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="total-section">
                            <div class="total-row">
                                <span>Subtotal:</span>
                                <span>LKR ${(order.totalAmount - order.shippingCost).toFixed(2)}</span>
                            </div>
                            <div class="total-row">
                                <span>Shipping Cost:</span>
                                <span>LKR ${order.shippingCost.toFixed(2)}</span>
                            </div>
                            <div class="total-row">
                                <span>Total Amount:</span>
                                <span>LKR ${order.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p>Thank you for shopping with Mind Matters!</p>
                            <p>For any queries, please contact our support team.</p>
                            <p>This is a computer-generated invoice. No signature required.</p>
                        </div>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    return (
        <button
            className="text-sm text-gray-700 text-center w-full sm:w-48 py-2 border rounded-lg hover:bg-yellow-500 hover:text-white transition-all duration-300"
            onClick={handlePrint}
        >
            Print Invoice
        </button>
    );
};

export default InvoicePrint; 