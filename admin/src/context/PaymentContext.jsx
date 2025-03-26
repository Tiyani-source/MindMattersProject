import { createContext, useState } from 'react';
import axios from 'axios';

export const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
    const [pToken, setPToken] = useState(localStorage.getItem("pToken") || null);
    const [paymentData, setPaymentData] = useState(null);

    const getPaymentData = async () => {
        try {
            const response = await axios.get("http://localhost:4000/api/payments/dashboard", {
                headers: { Authorization: `Bearer ${pToken}` }
            });
            setPaymentData(response.data);
        } catch (error) {
            console.error("Error fetching payment data:", error);
        }
    };

    const completePayment = async (paymentId) => {
        try {
            await axios.put(`http://localhost:4000/api/payments/${paymentId}/complete`, {}, {
                headers: { Authorization: `Bearer ${pToken}` }
            });
            getPaymentData(); // Refresh data
        } catch (error) {
            console.error("Error completing payment:", error);
        }
    };

    // Refund Payment
    const refundPayment = async (paymentId) => {
        try {
            await axios.put(`http://localhost:4000/api/payments/${paymentId}/refund`, {}, {
                headers: { Authorization: `Bearer ${pToken}` }
            });
            getPaymentData(); // Refresh data
        } catch (error) {
            console.error("Error processing refund:", error);
        }
    };

    // Soft Delete (Remove Record)
    const removeRecord = async (paymentId) => {
        try {
            await axios.put(`http://localhost:4000/api/payments/${paymentId}/remove`, {}, {
                headers: { Authorization: `Bearer ${pToken}` }
            });
            getPaymentData(); // Refresh data
        } catch (error) {
            console.error("Error removing record:", error);
        }
    };

    return (
        <PaymentContext.Provider value={{ 
            pToken, 
            paymentData, 
            getPaymentData, 
            completePayment, 
            refundPayment, 
            removeRecord 
        }}>
            {children}
        </PaymentContext.Provider>
    );
};
