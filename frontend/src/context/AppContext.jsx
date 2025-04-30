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
    const [therapist, setTherapist] = useState([])
    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '')
    const [userData, setUserData] = useState(false)
    const [studentData, setStudentData] = useState(null)
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

    const getTherapistData = async () => {
        try {
            console.log('Making API call to fetch therapist list...');
            const { data } = await axios.get(backendUrl + '/api/therapist/list')
            console.log('Raw API response:', data);

            if (data.success) {
                console.log('Setting therapist data:', data.therapists);
                setTherapist(data.therapists)
            } else {
                console.error('API returned error:', data.message);
                toast.error(data.message)
            }
        } catch (error) {
            console.error('API call failed:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            toast.error(error.message)
        }
    }

    const [therapistAvailability, setTherapistAvailability] = useState([]);

    const getTherapistAvailability = async (therapistID) => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/therapist/availability/${therapistID}`);
            if (data.success) {
                setTherapistAvailability(data.availability);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getFormattedAvailability = async (therapistId) => {
        try {
            console.log('Fetching availability for therapist:', therapistId);

            // First, fetch the therapist's availability
            const { data } = await axios.get(
                `${backendUrl}/api/therapist/availability/${therapistId}`
            );

            // Also fetch existing appointments for this therapist
            const appointmentsResponse = await axios.get(
                `${backendUrl}/api/student/appointments/therapist/${therapistId}`,
                { headers: { token } }
            );

            console.log('Raw availability data:', data);
            console.log('Existing appointments:', appointmentsResponse.data);

            if (data.success) {
                const flat = [];
                const bookedSlots = new Map();

                // Get the therapist's data
                const currentTherapist = therapist.find(t =>
                    t._id === therapistId ||
                    t._id?.toString() === therapistId?.toString()
                );

                if (!currentTherapist) {
                    console.error('Therapist not found');
                    return [];
                }

                // First, mark slots as booked from existing appointments
                if (appointmentsResponse.data.success) {
                    appointmentsResponse.data.appointments.forEach(appointment => {
                        const appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
                        const appointmentTime = appointment.timeSlot?.startTime;

                        if (appointmentDate && appointmentTime) {
                            if (!bookedSlots.has(appointmentDate)) {
                                bookedSlots.set(appointmentDate, new Set());
                            }
                            bookedSlots.get(appointmentDate).add(appointmentTime);
                        }
                    });
                }

                // Then add slots from slots_booked
                if (currentTherapist.slots_booked) {
                    const slotsBooked = currentTherapist.slots_booked instanceof Map ?
                        currentTherapist.slots_booked :
                        new Map(Object.entries(currentTherapist.slots_booked));

                    slotsBooked.forEach((timeSlots, date) => {
                        const timeMap = timeSlots instanceof Map ?
                            timeSlots :
                            new Map(Object.entries(timeSlots));

                        timeMap.forEach((isBooked, time) => {
                            if (isBooked) {
                                if (!bookedSlots.has(date)) {
                                    bookedSlots.set(date, new Set());
                                }
                                bookedSlots.get(date).add(time);
                            }
                        });
                    });
                }

                // Process availability data
                if (data.availability && typeof data.availability === 'object') {
                    Object.entries(data.availability).forEach(([date, timeSlots]) => {
                        const bookedTimesForDate = bookedSlots.get(date) || new Set();

                        Object.entries(timeSlots).forEach(([time, types]) => {
                            // Skip if this time is already booked
                            if (bookedTimesForDate.has(time)) {
                                console.log(`Skipping booked slot: ${date} ${time}`);
                                return;
                            }

                            // Add each available type as a separate slot
                            if (Array.isArray(types)) {
                                types.forEach(slot => {
                                    if (!slot.isBooked) {
                                        flat.push({
                                            date,
                                            time,
                                            type: slot.type,
                                            isBooked: false
                                        });
                                    }
                                });
                            }
                        });
                    });
                }

                console.log('Available slots (filtered):', flat);
                return flat;
            } else {
                console.error('Failed to load availability:', data.message);
                toast.error('Failed to load availability');
                return [];
            }
        } catch (err) {
            console.error('Error loading availability:', err);
            console.error('Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
            toast.error('Error loading availability');
            return [];
        }
    };

    const bookTherapistAppointment = async ({
        therapistID,
        date,
        time,
        typeOfAppointment,
        meetingLink
    }) => {
        try {
            console.log('Making appointment booking request:', {
                therapistID,
                date,
                time,
                typeOfAppointment
            });

            const res = await axios.post(
                `${backendUrl}/api/student/book-therapist`,
                {
                    therapistID,
                    date,
                    time,
                    typeOfAppointment
                },
                {
                    headers: {
                        token,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Booking response:', res.data);

            if (res.data.success) {
                toast.success('Booking successful');
            } else {
                toast.error(res.data.message || 'Booking failed');
            }

            return res.data;
        } catch (err) {
            console.error('Booking error:', err);
            console.error('Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                stack: err.stack
            });
            toast.error(err.response?.data?.message || 'Booking failed');
            return { success: false, message: err.message };
        }
    };
    const rescheduleTherapistAppointment = async ({
        appointmentId,
        newDate,
        newTime,
        typeOfAppointment
    }) => {
        try {
            const res = await axios.post(
                `${backendUrl}/api/student/reschedule-appointment`,
                {
                    appointmentId,
                    newDate,
                    newTime,
                    typeOfAppointment
                },
                { headers: { token } }
            );
            return res.data;
        } catch (err) {
            toast.error("Failed to reschedule appointment");
            return { success: false, message: err.message };
        }
    };

    const confirmCancellation = async (appointmentId) => {
        try {
            const res = await fetch(`${backendUrl}/api/student/cancel-appointment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    token
                },
                body: JSON.stringify({ appointmentId })
            });

            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                getUserAppointments(); // refresh list
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            console.error(err);
            toast.error("Cancellation failed");
        }
    };

    const [appointments, setAppointments] = useState([]);

    const getUserAppointments = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/student/appointments/therapists', {
                headers: { token }
            });
            console.log("Fetched appointment data:", data);
            if (data.success) {
                setAppointments(data.appointments);
            } else {
                console.error("Failed to fetch appointments:", data.message);
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Network or API error fetching appointments:", error);
            toast.error(error.message);
        }
    };



    const handleViewMeetingClick = async (appointmentId) => {
        try {
            const res = await fetch(`${backendUrl}/api/student/meeting-link`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    token
                },
                body: JSON.stringify({ appointmentId })
            });

            const data = await res.json();
            if (data.success) {
                return data.meetingLink;
            } else {
                toast.error(data.message);
                return null;
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load meeting link");
            return null;
        }
    };

    // Add this new function for loading student data
    const loadStudentData = async () => {
        try {
            console.log('Loading student data with token:', token);
            const { data } = await axios.get(`${backendUrl}/api/student/profile`, {
                headers: { token }
            });

            console.log('Student data response:', data);
            if (data.success) {
                setStudentData(data.student);
                setUserData(data.student); // Also set in userData for compatibility
            } else {
                console.error('Failed to load student data:', data.message);
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error loading student data:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            toast.error('Failed to load student data');
        }
    };

    useEffect(() => {
        getDoctosData()
        getTherapistData()
    }, [])

    useEffect(() => {
        if (token) {
            const currentPath = window.location.pathname;
            if (currentPath.includes('/appointment') || currentPath.includes('/my-appointments')) {
                loadStudentData(); // Load student data for appointment-related pages
            } else {
                loadUserProfileData(); // Load regular user data for other pages
            }
            getWishlist()
            getCart()
        }
    }, [token])

    const value = {
        doctors, getDoctosData,
        therapist, getTherapistData, appointments, getUserAppointments,
        therapistAvailability, getTherapistAvailability,
        getFormattedAvailability,
        bookTherapistAppointment,
        rescheduleTherapistAppointment,
        confirmCancellation,
        handleViewMeetingClick,
        currencySymbol,
        backendUrl,
        token, setToken,
        userData, setUserData,
        studentData, setStudentData,
        loadStudentData,
        loadUserProfileData,
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