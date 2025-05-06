import { useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import axios from "axios";
import {
    TextField,
    Button,
    Box,
    Typography,
    InputAdornment,
    Paper
} from '@mui/material';
import { FaUser, FaEnvelope, FaCreditCard, FaCalendarAlt, FaLock } from 'react-icons/fa';

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
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                maxWidth: 400,
                margin: 'auto',
                mt: 6,
                p: 4,
                boxShadow: 3,
                borderRadius: 2,
                backgroundColor: '#fff'
            }}
        >
            <Typography variant="h5" align="center" gutterBottom>
                Payment Form
            </Typography>

            <TextField
                fullWidth
                label="Name"
                name="name"
                onChange={handleChange}
                margin="normal"
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <FaUser />
                        </InputAdornment>
                    )
                }}
            />

            <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <FaEnvelope />
                        </InputAdornment>
                    )
                }}
            />

            <TextField
                fullWidth
                label="Amount"
                name="amount"
                value={amount}
                margin="normal"
                InputProps={{
                    readOnly: true,
                    startAdornment: (
                        <InputAdornment position="start">₹</InputAdornment>
                    )
                }}
            />

            <TextField
                fullWidth
                label="Card Number"
                name="cardNumber"
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <FaCreditCard />
                        </InputAdornment>
                    )
                }}
            />

            <TextField
                fullWidth
                label="Expiry Date (MM/YY)"
                name="expiryDate"
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <FaCalendarAlt />
                        </InputAdornment>
                    )
                }}
            />

            <TextField
                fullWidth
                label="CVV"
                name="cvv"
                type="password"
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <FaLock />
                        </InputAdornment>
                    )
                }}
            />

            <Button
                variant="contained"
                color="primary"
                type="submit"
                fullWidth
                sx={{ mt: 3 }}
            >
                Pay Now
            </Button>
        </Box>
    );
};

export default PaymentForm;
