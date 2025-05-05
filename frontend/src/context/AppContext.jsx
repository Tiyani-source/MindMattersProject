import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from 'axios'
import jsPDF from 'jspdf'; //for handlePrintInvoice
import { products } from "../assets/assets";


export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currencySymbol = 'LKR'
    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [doctors, setDoctors] = useState([])
    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '')
    const [userData, setUserData] = useState(false)
    const [studentData, setStudentData] = useState(false)
    const [orders, setOrders] = useState([]); // orders state
    const [wishlist, setWishlist] = useState({ items: [] }); // wishlist state
    const [cart, setCart] = useState({ items: [], shippingCost: 500 }); // cart state with default shipping cost
    const [isLoading, setIsLoading] = useState(false);

    // Getting Doctors using API
    const getDoctosData = async () => {

        try {

            const { data } = await axios.get(backendUrl + '/api/doctor/list')
            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }

    }

    // Getting Student Profile using API
    const loadStudentProfileData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/student/get-profile', { 
                headers: { 
                    Authorization: `Bearer ${token}` 
                } 
            });

            if (data.success) {
                setStudentData(data.studentData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    // Create a new order
    const createOrder = async (orderData) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/orders/create`, orderData, {
                headers: { 
                    Authorization: `Bearer ${token}` 
                }
            });
        
            if (data.success) {
                return data.data; // Changed from data.order to data.data to match backend response
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Create order failed:", error);
            toast.error(error.response?.data?.message || "Failed to create order");
        }
    };

    //  Fetch orders by studentId
    const fetchOrders = async (studentId) => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/orders/user/${studentId}`, {
                headers: { 
                    Authorization: `Bearer ${token}` 
                }
            });
            
            if (data.success) {
                setOrders(data.data || []);
            } else {
                toast.error(data.message || "Failed to fetch orders");
                setOrders([]);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast.error(error.response?.data?.message || "Failed to fetch orders");
            setOrders([]);
        }
    };

    //Cancel Order
    const cancelOrder = async (userId, orderId, cancelReason) => {
        try {
            const { data } = await axios.patch(
                `${backendUrl}/api/orders/${orderId}/cancel`,
                { cancelReason }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
          
            if (data.success) {
                fetchOrders(userId);
                toast.success("Order cancelled successfully");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Failed to cancel order:", error);
            toast.error(error.response?.data?.message || "Something went wrong while cancelling the order");
        }
    };

     // Generates and downloads a PDF invoice
    const handlePrintInvoice = (order) => {
        const doc = new jsPDF();
        
        // Set document properties
        doc.setProperties({
            title: `Invoice_${order.orderId}`,
            subject: 'Order Invoice',
            author: 'Mind Matters',
            keywords: 'invoice, order, mind matters',
            creator: 'Mind Matters Store'
        });

        // Add header with logo space
        doc.setFillColor(44, 62, 80); // Dark blue-gray
        doc.rect(0, 0, 210, 30, 'F');
        
        // Company name in header
        doc.setFontSize(24);
        doc.setTextColor(255, 255, 255); // White
        doc.text("Mind Matters", 20, 20);
        
        // Invoice title
        doc.setFontSize(16);
        doc.setTextColor(44, 62, 80);
        doc.text("INVOICE", 150, 20);

        // Invoice details
        doc.setFontSize(10);
        doc.setTextColor(52, 73, 94);
        doc.text(`Invoice #: ${order.orderId}`, 150, 30);
        doc.text(`Date: ${new Date(order.date).toLocaleDateString()}`, 150, 35);
        doc.text(`Status: ${order.status}`, 150, 40);

        // Add a decorative line
        doc.setDrawColor(189, 195, 199);
        doc.setLineWidth(0.5);
        doc.line(20, 45, 190, 45);

        // Customer details section
        doc.setFontSize(12);
        doc.setTextColor(44, 62, 80);
        doc.text("Bill To:", 20, 60);

        doc.setFontSize(10);
        doc.setTextColor(52, 73, 94);
        doc.text(`${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`, 20, 67);
        doc.text(order.shippingInfo.email, 20, 72);
        doc.text(order.shippingInfo.phone, 20, 77);

        // Shipping address
        doc.setFontSize(10);
        const address = [
            order.shippingInfo.address,
            order.shippingInfo.apartment,
            `${order.shippingInfo.city}, ${order.shippingInfo.district}`,
            `${order.shippingInfo.postalCode}, ${order.shippingInfo.country}`
        ].filter(Boolean);
        
        address.forEach((line, index) => {
            doc.text(line, 20, 87 + (index * 5));
        });

        // Items table header
        doc.setFillColor(240, 240, 240);
        doc.rect(20, 110, 170, 8, 'F');
        
        doc.setFontSize(10);
        doc.setTextColor(44, 62, 80);
        doc.text("Item", 20, 115);
        doc.text("Attributes", 80, 115);
        doc.text("Qty", 130, 115);
        doc.text("Price", 150, 115);
        doc.text("Total", 170, 115);

        // Items list
        let yPos = 125;
        order.items.forEach((item, index) => {
            // Alternate row colors
            if (index % 2 === 0) {
                doc.setFillColor(250, 250, 250);
                doc.rect(20, yPos - 5, 170, 10, 'F');
            }

            doc.setTextColor(52, 73, 94);
            doc.setFontSize(9);

            // Item details
            doc.text(item.name.substring(0, 30), 20, yPos);
            
            // Attributes (Color and Size)
            let attributes = [];
            if (item.color) attributes.push(`Color: ${item.color}`);
            if (item.size) attributes.push(`Size: ${item.size}`);
            doc.text(attributes.join(", "), 80, yPos);
            
            // Quantity and Prices
            doc.text(item.quantity.toString(), 130, yPos);
            doc.text(`${currencySymbol} ${item.price.toFixed(2)}`, 150, yPos);
            doc.text(`${currencySymbol} ${(item.price * item.quantity).toFixed(2)}`, 170, yPos);

            yPos += 10;
        });

        // Add a line after items
        doc.setDrawColor(189, 195, 199);
        doc.line(20, yPos, 190, yPos);
        yPos += 10;

        // Summary section
        doc.setFontSize(10);
        doc.setTextColor(52, 73, 94);
        
        // Subtotal
        doc.text("Subtotal:", 150, yPos);
        doc.text(`${currencySymbol} ${(order.totalAmount - order.shippingCost).toFixed(2)}`, 170, yPos);
        yPos += 7;

        // Shipping cost
        doc.text("Shipping Cost:", 150, yPos);
        doc.text(`${currencySymbol} ${order.shippingCost.toFixed(2)}`, 170, yPos);
        yPos += 7;

        // Total
        doc.setFontSize(12);
        doc.setTextColor(44, 62, 80);
        doc.text("Total Amount:", 150, yPos);
        doc.text(`${currencySymbol} ${order.totalAmount.toFixed(2)}`, 170, yPos);
        yPos += 20;

        // Payment terms
        doc.setFontSize(9);
        doc.setTextColor(127, 140, 141);
        doc.text("Payment Terms: Due upon receipt", 20, yPos);
        doc.text("Payment Method: Online Payment", 20, yPos + 5);

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(127, 140, 141);
        doc.text("Thank you for shopping with Mind Matters!", 20, yPos + 20);
        doc.text("For any queries, please contact our support team.", 20, yPos + 25);
        doc.text("This is a computer-generated invoice. No signature required.", 20, yPos + 30);

        // Add page border
        doc.setDrawColor(189, 195, 199);
        doc.setLineWidth(0.5);
        doc.rect(10, 10, 190, 277);

        // Save the PDF
        doc.save(`Invoice_${order.orderId}.pdf`);
    };

    // Returns filtered orders list by status
    const getFilteredOrders = (orders, filter) => {
        if (filter === "All") return orders;
          
        if (filter === "PendingOrShipped") {
            return orders.filter(order => order.status === "Pending" || order.status === "Shipped");
        }
          
        return orders.filter(order => order.status === filter);
    };

// Get user's wishlist
const getWishlist = async () => {
    try {
        setIsLoading(true);
        const { data } = await axios.get(`${backendUrl}/api/wishlist`, {
            headers: { 
                Authorization: `Bearer ${token}` 
            }
        });
        if (data.success) {
            setWishlist(data.wishlist || { items: [] });
        } else {
            toast.error(data.message || 'Failed to load wishlist');
        }
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        if (error.response?.status === 401) {
            toast.error('Please login again');
            setToken('');
            localStorage.removeItem('token');
        } else {
            toast.error(error.response?.data?.message || 'Failed to load wishlist');
        }
    } finally {
        setIsLoading(false);
    }
};

// Add item to wishlist
const addToWishlist = async (itemData) => {
    try {
        setIsLoading(true);
        const { data } = await axios.post(
            `${backendUrl}/api/wishlist`,
            itemData,
            {
                headers: { 
                    Authorization: `Bearer ${token}` 
                }
            }
        );

        if (data.success) {
            setWishlist(data.wishlist || { items: [] });
            toast.success('Item added to wishlist successfully');
        } else {
            toast.error(data.message || 'Failed to add item to wishlist');
        }
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        if (error.response?.status === 401) {
            toast.error('Please login again');
            setToken('');
            localStorage.removeItem('token');
        } else {
            toast.error(error.response?.data?.message || 'Failed to add item to wishlist');
        }
    } finally {
        setIsLoading(false);
    }
};

// Remove item from wishlist
const removeFromWishlist = async (productId) => {
    try {
        if (!productId) {
            throw new Error('Product ID is required');
        }

        setIsLoading(true);
        const { data } = await axios.delete(
            `${backendUrl}/api/wishlist/${productId}`,
            { 
                headers: { 
                    Authorization: `Bearer ${token}` 
                } 
            }
        );
        
        if (!data) {
            throw new Error('No response from server');
        }
        
        if (data.success) {
            // Update wishlist state optimistically
            setWishlist(prevWishlist => ({
                ...prevWishlist,
                items: prevWishlist.items.filter(item => item.productId !== productId)
            }));
            
            // Then fetch fresh data to ensure consistency
            const { data: freshData } = await axios.get(`${backendUrl}/api/wishlist`, {
                headers: { 
                    Authorization: `Bearer ${token}` 
                }
            });
            
            if (freshData.success) {
                setWishlist(freshData.wishlist || { items: [] });
            }
            
            toast.success('Item removed from wishlist');
        } else {
            throw new Error(data.message || 'Failed to remove item from wishlist');
        }
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        console.error('Error details:', error.response?.data);
        
        // Revert optimistic update on error
        const { data: freshData } = await axios.get(`${backendUrl}/api/wishlist`, {
            headers: { 
                Authorization: `Bearer ${token}` 
            }
        });
        
        if (freshData.success) {
            setWishlist(freshData.wishlist || { items: [] });
        }
        
        if (error.response?.status === 401) {
            toast.error('Please login again');
            setToken('');
            localStorage.removeItem('token');
        } else {
            toast.error(error.response?.data?.message || error.message || 'Failed to remove item from wishlist');
        }
        throw error;
    } finally {
        setIsLoading(false);
    }
};

    // Get student's cart
    const getCart = async () => {
        try {
            setIsLoading(true);
            const { data } = await axios.get(`${backendUrl}/api/cart`, {
                headers: { 
                    Authorization: `Bearer ${token}` 
                }
            });
            if (data.success) {
                setCart(data.cart || { items: [], shippingCost: 500 });
            } else {
                toast.error(data.message || 'Failed to load cart');
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
            if (error.response?.status === 401) {
                toast.error('Please login again');
                setToken('');
                localStorage.removeItem('token');
            } else {
                toast.error(error.response?.data?.message || 'Failed to load cart');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Add item to cart
    const addToCart = async (cartItem) => {
        try {
            setIsLoading(true);
            const { data } = await axios.post(
                `${backendUrl}/api/cart`,
                cartItem,
                { 
                    headers: { 
                        Authorization: `Bearer ${token}` 
                    } 
                }
            );
            if (data.success) {
                setCart(data.cart || { items: [], shippingCost: 500 });
                toast.success('Item added to cart successfully');
            } else {
                toast.error(data.message || 'Failed to add item to cart');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            if (error.response?.status === 401) {
                toast.error('Please login again');
                setToken('');
                localStorage.removeItem('token');
            } else {
                toast.error(error.response?.data?.message || 'Failed to add item to cart');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Remove item from cart
    const removeFromCart = async (productId) => {
        try {
            setIsLoading(true);
            const { data } = await axios.delete(
                `${backendUrl}/api/cart/${productId}`,
                { 
                    headers: { 
                        Authorization: `Bearer ${token}` 
                    } 
                }
            );
            if (data.success) {
                setCart(data.cart || { items: [], shippingCost: 500 });
                toast.success('Item removed from cart');
            } else {
                toast.error(data.message || 'Failed to remove item from cart');
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            if (error.response?.status === 401) {
                toast.error('Please login again');
                setToken('');
                localStorage.removeItem('token');
            } else {
                toast.error(error.response?.data?.message || 'Failed to remove item from cart');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Clear entire cart
    const clearCart = async () => {
        try {
            setIsLoading(true);
            const { data } = await axios.delete(
                `${backendUrl}/api/cart/clear`,
                { 
                    headers: { 
                        Authorization: `Bearer ${token}` 
                    } 
                }
            );
            if (data.success) {
                setCart({ items: [], shippingCost: 500 });
                toast.success('Cart cleared successfully');
            } else {
                toast.error(data.message || 'Failed to clear cart');
            }
        } catch (error) {
            console.error('Error clearing cart:', error);
            if (error.response?.status === 401) {
                toast.error('Please login again');
                setToken('');
                localStorage.removeItem('token');
            } else {
                toast.error(error.response?.data?.message || 'Failed to clear cart');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Update cart item quantity
    const updateCartItemQuantity = async (productId, newQuantity) => {
        try {
            setIsLoading(true);
            const { data } = await axios.patch(
                `${backendUrl}/api/cart/${productId}/quantity`,
                { quantity: newQuantity },
                { 
                    headers: { 
                        Authorization: `Bearer ${token}` 
                    } 
                }
            );
            if (data.success) {
                setCart(data.cart || { items: [], shippingCost: 500 });
                toast.success('Quantity updated successfully');
            } else {
                toast.error(data.message || 'Failed to update quantity');
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            if (error.response?.status === 401) {
                toast.error('Please login again');
                setToken('');
                localStorage.removeItem('token');
            } else {
                toast.error(error.response?.data?.message || 'Failed to update quantity');
            }
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        getDoctosData()
    }, [])

    useEffect(() => {
        if (token) {
            loadStudentProfileData();
            getWishlist();
            getCart();
        }
    }, [token])

    const value = {
        doctors, getDoctosData,
        currencySymbol,
        backendUrl,
        token, setToken,
        studentData, setStudentData, loadStudentProfileData,
        orders, setOrders, fetchOrders,
        createOrder,
        cancelOrder,
        handlePrintInvoice,
        getFilteredOrders,
        wishlist, setWishlist,
        getWishlist,
        addToWishlist,
        removeFromWishlist,
        cart, setCart,
        getCart,
        addToCart,
        removeFromCart,
        clearCart,
        updateCartItemQuantity,
        isLoading
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}

export default AppContextProvider