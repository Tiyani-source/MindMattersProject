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
    //const [studentData, setStudentData] = useState(false)
    const [studentData, setStudentData] = useState(null)
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
                localStorage.setItem('studentData', JSON.stringify(data.studentData));
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
        // Check if product already exists in wishlist
        const isDuplicate = wishlist.items.some(item => item.productId === itemData.productId);
        if (isDuplicate) {
            toast.info('Product is already in your wishlist');
            return;
        }

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
            // Check if the backend response indicates a duplicate
            if (data.message && data.message.toLowerCase().includes('already in wishlist')) {
                toast.info('Product is already in your wishlist');
            } else {
                toast.success('Product added to wishlist successfully');
            }
        } else {
            // If the backend indicates it's a duplicate
            if (data.message && data.message.toLowerCase().includes('already in wishlist')) {
                toast.info('Product is already in your wishlist');
            } else {
                toast.error(data.message || 'Failed to add item to wishlist');
            }
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
            loadUserProfileData()
            loadStudentProfileData();
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
        userData, setUserData, loadUserProfileData,
        studentData, setStudentData, loadStudentProfileData,
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