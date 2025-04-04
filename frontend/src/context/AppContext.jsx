import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from 'axios'
import jsPDF from 'jspdf'; //for handlePrintInvoice

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currencySymbol = 'LKR'
    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [doctors, setDoctors] = useState([])
    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '')
    const [userData, setUserData] = useState(false)
    const [orders, setOrders] = useState([]); // orders state

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

            const { data } = await axios.get(backendUrl + '/api/user/get-profile', { headers: { token } })

            if (data.success) {
                setUserData(data.userData)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }

    }

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

    

    useEffect(() => {
        getDoctosData()
    }, [])

    useEffect(() => {
        if (token) {
            loadUserProfileData()
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
        getFilteredOrders 
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}

export default AppContextProvider