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
    const [orders, setOrders] = useState([]); // orders state
    const [wishlist, setWishlist] = useState([]); // wishlist state
    const [cart, setCart] = useState({ items: [] }); // cart state
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

    // Getting User Profile using API
    const loadUserProfileData = async () => {
        try {
          const { data } = await axios.get(`${backendUrl}/api/student/profile`, {
            headers: { token },
          });
      
          console.log("DEBUG: /student/profile response =>", data); // 👈 Add this
      
          if (data.success) {
            // Temporarily log all possible keys
            setUserData(
              data.student || data.userData || data.user || null
            );
          } else {
            toast.error(data.message || "Failed to load user profile");
          }
        } catch (error) {
          console.error("Profile load error:", error);
          toast.error("Error loading profile");
        }
      };

    // Create a new order
    const createOrder = async (orderData) => {
        try {
        const { data } = await axios.post(`${backendUrl}/api/orders/create`, orderData, {
            headers: { token },
        });
    
        if (data.success) {
            return data.order;
        } else {
            toast.error(data.message);
        }
        } catch (error) {
        console.error("Create order failed:", error);
        toast.error(error.response?.data?.message || "Failed to create order");
        }
    };

    //  Fetch orders by userId
    const fetchOrders = async (userId) => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/orders/user/${userId}`, {

                headers: { token }
                });
                setOrders(data);

            
        } catch (error) {
                console.log(error);
                toast.error("Failed to fetch orders");
            }
        };

    //Cancel Order
    const cancelOrder = async (userId, orderId) => {
        try {
            const { data } = await axios.patch(
                `${backendUrl}/api/orders/user/${userId}/order/${orderId}/cancel`,
                {}, 
                { headers: { token } }
            );
          
            if (data.success) {
                fetchOrders(userId);
                toast.success("Order cancelled successfully");
            } else {
                toast.error(data.message);
            }
            } catch (error) {
              console.error("Failed to cancel order:", error);
              toast.error("Something went wrong while cancelling the order");
            }
    };

     // Generates and downloads a PDF invoice
    const handlePrintInvoice = (order) => {
        const doc = new jsPDF();
          
        doc.setFontSize(16);
        doc.text("Invoice", 20, 20);
          
        doc.setFontSize(12);
        doc.text(`Order ID: ${order.orderId}`, 20, 40);
        doc.text(`Date: ${new Date(order.date).toLocaleDateString()}`, 20, 50);
        doc.text(`Status: ${order.status}`, 20, 60);
        doc.text(`Total Amount: ${currencySymbol} ${order.totalAmount}`, 20, 70);
          
        doc.text("Items:", 20, 90);
        order.items.forEach((item, index) => {
            doc.text(
            `${index + 1}. ${item.name} x${item.quantity} - ${currencySymbol} ${item.price * item.quantity}`,
            20,
            100 + index * 10
            );
        });
        doc.text(`Shipping Cost: ${currencySymbol} ${order.shippingCost}`, 20, 80);

        if (order.discount?.amount > 0) {
        doc.text(`Discount Applied (${order.discount.code}): -${currencySymbol} ${order.discount.amount}`, 20, 90);
        doc.text("Items:", 20, 110);
         
        } else {
        doc.text("Items:", 20, 100);
        
        }
          
        doc.text("Thank you for your purchase!", 20, 120 + order.items.length * 10);
          
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
          const token = localStorage.getItem('token'); 
      
          const response = await axios.get('/api/wishlist', {
            headers: {
              Authorization: `Bearer ${token}` 
            }
          });
      
          console.log(response.data);
          // Update state here with response.data if needed
        } catch (error) {
          console.error('Error fetching wishlist:', error);
        }
      };

    // Add item to wishlist
    const addToWishlist = async (productId, name, price) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/wishlist/`,
                { productId, name, price },
                { headers: { token } }
            );
            if (data.success) {
                setWishlist(data.data?.items || []);
                toast.success('Item added to wishlist');
            } else {
                toast.error(data.message || 'Failed to add item to wishlist');
            }
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            toast.error(error.response?.data?.message || 'Failed to add item to wishlist');
        }
    };

    // Remove item from wishlist
    const removeFromWishlist = async (productId) => {
        try {
            const { data } = await axios.delete(
                `${backendUrl}/api/wishlist/${productId}`,
                { headers: { token } }
            );
            if (data.success) {
                setWishlist(data.data?.items || []);
                toast.success('Item removed from wishlist');
            } else {
                toast.error(data.message || 'Failed to remove item from wishlist');
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            toast.error(error.response?.data?.message || 'Failed to remove item from wishlist');
        }
    };

    // Get user's cart
    const getCart = async () => {
        try {
            setIsLoading(true);
            const { data } = await axios.get(`${backendUrl}/api/cart`, {
                headers: { token }
            });
            if (data.success) {
                setCart(data.cart || { items: [] });
            } else {
                toast.error(data.message || 'Failed to load cart');
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
            toast.error(error.response?.data?.message || 'Failed to load cart');
        } finally {
            setIsLoading(false);
        }
    };

    // Add item to cart
    const addToCart = async (productId, name, price, quantity = 1) => {
        try {
            setIsLoading(true);
            const { data } = await axios.post(
                `${backendUrl}/api/cart`,
                { productId, name, price, quantity },
                { headers: { token } }
            );
            if (data.success) {
                setCart(data.cart);
                toast.success('Item added to cart');
            } else {
                toast.error(data.message || 'Failed to add item to cart');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error(error.response?.data?.message || 'Failed to add item to cart');
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
                { headers: { token } }
            );
            if (data.success) {
                setCart(data.cart);
                toast.success('Item removed from cart');
            } else {
                toast.error(data.message || 'Failed to remove item from cart');
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            toast.error(error.response?.data?.message || 'Failed to remove item from cart');
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
                { headers: { token } }
            );
            if (data.success) {
                setCart({ items: [] });
                toast.success('Cart cleared successfully');
            } else {
                toast.error(data.message || 'Failed to clear cart');
            }
        } catch (error) {
            console.error('Error clearing cart:', error);
            toast.error(error.response?.data?.message || 'Failed to clear cart');
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        getDoctosData()
    }, [])

    useEffect(() => {
        if (token) {
            loadUserProfileData()
            getWishlist()
            getCart()
        }
    }, [token])

    const value = {
        doctors, getDoctosData,
        currencySymbol,
        backendUrl,
        token, setToken,
        userData, setUserData, loadUserProfileData,
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
        isLoading

    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}

export default AppContextProvider