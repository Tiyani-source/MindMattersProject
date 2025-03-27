import { useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import axios from "axios";

const PaymentForm = () => {
    const { amount, appointmentId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        amount: amount,
        cardNumber: "",
        expiryDate: "",
        cvv: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Form validations
        if (!formData.name.trim()) {
            alert("Name is required!");
            return;
        }
        if (!formData.email.includes("@")) {
            alert("Invalid email address!");
            return;
        }
        if (!/^\d{16}$/.test(formData.cardNumber)) {
            alert("Card Number must be 16 digits!");
            return;
        }
        if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
            alert("Expiry Date must be in MM/YY format!");
            return;
        }
        if (!/^\d{3}$/.test(formData.cvv)) {
            alert("CVV must be 3 digits!");
            return;
        }

        try {
            const data = { ...formData, appointmentId };
            const response = await axios.post("http://localhost:4000/api/payments", data);
            alert("Payment Successful!");
            console.log(response.data);
            navigate(-1);
        } catch (error) {
            alert("Payment Failed!");
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="payment-form flex flex-col gap-4 p-6 max-w-md mx-auto bg-white shadow-md rounded-md">
            <h2 className="text-2xl font-bold text-center mb-4">Payment Form</h2>
            <input
                type="text"
                name="name"
                placeholder="Name"
                onChange={handleChange}
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
                type="number"
                name="amount"
                placeholder="Amount"
                readOnly
                value={amount}
                className="border border-gray-300 rounded-md p-2 bg-gray-100 cursor-not-allowed"
            />
            <input
                type="text"
                name="cardNumber"
                placeholder="Card Number"
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
                type="text"
                name="expiryDate"
                placeholder="Expiry Date (MM/YY)"
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
                type="password"
                name="cvv"
                placeholder="CVV"
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
            >
                Pay Now
            </button>
        </form>
    );
};

export default PaymentForm;
