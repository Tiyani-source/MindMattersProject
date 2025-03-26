import { useState } from "react";
import axios from "axios";

const PaymentForm = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        amount: "",
        /*cardNumber: "",
        expiryDate: "",
        cvv: "",*/
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:4000/api/payments", formData);
            alert("Payment Successful!");
            console.log(response.data);
        } catch (error) {
            alert("Payment Failed!");
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="payment-form">
            <h2>Payment Form</h2>
            <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
            <input type="number" name="amount" placeholder="Amount" onChange={handleChange} required />
            <input type="text" name="cardNumber" placeholder="Card Number" onChange={handleChange} required />
            <input type="text" name="expiryDate" placeholder="Expiry Date (MM/YY)" onChange={handleChange} required />
            <input type="password" name="cvv" placeholder="CVV" onChange={handleChange} required />
            <button type="submit">Pay Now</button>
        </form>
    );
};

export default PaymentForm;
