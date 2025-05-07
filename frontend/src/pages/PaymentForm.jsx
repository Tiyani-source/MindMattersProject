// src/components/PaymentForm.jsx
import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  TextField,
  Button,
  Box,
  Typography,
  InputAdornment,
  Paper,
} from "@mui/material";
import { FaUser, FaEnvelope, FaCreditCard, FaCalendarAlt, FaLock } from "react-icons/fa";
import { toast } from "react-toastify";
import { useEffect } from "react";

const PaymentForm = () => {
  const { appointmentId } = useParams();
  console.log()
  const navigate = useNavigate();
  const location = useLocation();
  const { totalAmount, orderData } = location.state || {};
const [user, setUser] = useState({});
  const [formData, setFormData] = useState({
    name: user && user.firstName + " " + user &&user.lastName,
    email: user && user.email,
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    formData.name = user && user.firstName + " " + user &&user.lastName
    formData.email = user && user.email 
    // Form validations
    if (!formData.name.trim()) {
      toast.error("Name is required!");
      return;
    }
    console.log(formData.email)
    if (!formData.email.includes("@")) {
      toast.error("Invalid email address!");
      return;
    }
    if (!/^\d{16}$/.test(formData.cardNumber)) {
      toast.error("Card Number must be 16 digits!");
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      toast.error("Expiry Date must be in MM/YY format!");
      return;
    }
    if (!/^\d{3}$/.test(formData.cvv)) {
      toast.error("CVV must be 3 digits!");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:4000/api/orderspay/${appointmentId}/payment`,
        { ...formData },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (response.data.success) {
        toast.success("Payment Successful!");
        navigate("/order-confirmation", { state: { order: orderData } });
      } else {
        toast.error(response.data.message || "Payment Failed!");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment Failed! Please try again.");
    }
  };
useEffect(() => {
const loc = localStorage.getItem("studentData")
  if(loc){
    const userData = JSON.parse(loc)
    setUser(userData)
  }
},[])
  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 400,
        margin: "auto",
        mt: 6,
        p: 4,
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: "#fff",
      }}
    >
      <Typography variant="h5" align="center" gutterBottom>
        Payment for Order #{appointmentId}
      </Typography>

      <TextField
        fullWidth
        label="Name"
        name="name"
        value={user.firstName + " " + user.lastName}   
        onChange={handleChange}
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <FaUser />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        fullWidth
        label="Email"
        name="email"
        value={user.email}  
        type="email"
        onChange={handleChange}
        margin="normal"
        required
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <FaEnvelope />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        fullWidth
        label="Amount"
        name="amount"
        value={totalAmount ? `LKR ${totalAmount}` : "N/A"}
        margin="normal"
        InputProps={{
          readOnly: true,
          startAdornment: <InputAdornment position="start">LKR</InputAdornment>,
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
          ),
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
          ),
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
          ),
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