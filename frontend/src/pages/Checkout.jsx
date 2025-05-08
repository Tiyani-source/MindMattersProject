// src/components/Checkout.jsx
import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const Checkout = () => {
  const navigate = useNavigate();
  const { studentData, cart, createOrder, clearCart } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    postalCode: "",
    district: "",
    country: "Sri Lanka",
  });

  // Sri Lankan districts
  const districts = [
    { group: "Western Province", districts: ["Colombo", "Gampaha", "Kalutara"] },
    { group: "Central Province", districts: ["Kandy", "Matale", "Nuwara Eliya"] },
    { group: "Southern Province", districts: ["Galle", "Matara", "Hambantota"] },
    { group: "Northern Province", districts: ["Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu"] },
    { group: "Eastern Province", districts: ["Trincomalee", "Batticaloa", "Ampara"] },
    { group: "North Western Province", districts: ["Kurunegala", "Puttalam"] },
    { group: "North Central Province", districts: ["Anuradhapura", "Polonnaruwa"] },
    { group: "Uva Province", districts: ["Badulla", "Monaragala"] },
    { group: "Sabaragamuwa Province", districts: ["Ratnapura", "Kegalle"] },
  ];

  // Initialize form with student data if available
  useEffect(() => {
    if (studentData) {
      setFormData({
        firstName: studentData.firstName || "",
        lastName: studentData.lastName || "",
        email: studentData.email || "",
        phone: studentData.phone || "",
        address: studentData.address || "",
        apartment: studentData.apartment || "",
        city: studentData.city || "",
        postalCode: studentData.postalCode || "",
        district: studentData.district || "",
        country: studentData.country || "Sri Lanka",
      });
    }
  }, [studentData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = ["firstName", "lastName", "email", "phone", "address", "city", "postalCode", "district"];
    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Please fill in your ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate student data
    if (!studentData || !studentData._id) {
      toast.error("Student data is not available. Please try logging in again.");
      return;
    }

    // Validate cart
    if (!cart || !cart.items || cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Calculate total amount and shipping cost
      const shippingCost = 500; // Fixed shipping cost
      const subtotal = cart.items.reduce((sum, item) => {
        if (!item.price || !item.quantity) {
          throw new Error("Invalid cart item data");
        }
        return sum + item.price * item.quantity;
      }, 0);
      const totalAmount = subtotal + shippingCost;

      // Prepare order data
      const orderData = {
        orderId: `ORD${Date.now()}`,
        userId: studentData._id,
        products: cart.items.length,
        shippingCost,
        totalAmount,
        shippingInfo: formData,
        items: cart.items.map(item => ({
          productId: item.productId,
          name: item.name,
          quantity: parseInt(item.quantity) || 1,
          price: parseFloat(item.price) || 0,
          color: item.color || null,
          size: item.size || null,
          image: item.image || null,
          description: item.description || null,
          category: item.category || null
          
        }))
      };

      // Create temporary order
      const response = await axios.post("http://localhost:4000/api/orders/create", orderData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.data.success) {
        const order = response.data.order;
        // Navigate to PaymentForm with order data
        toast.success('Order created successfully!');
        navigate(`/payment/${order.orderId}`, {
          state: { totalAmount, orderData: order },
        });
      } else {
        throw new Error("Order creation failed");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error.response?.data?.message || "Failed to process checkout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Apartment/Suite (Optional)</label>
              <input
                type="text"
                name="apartment"
                value={formData.apartment}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">District</label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select District</option>
                  {districts.map((province, index) => (
                    <optgroup key={index} label={province.group}>
                      {province.districts.map((district, dIndex) => (
                        <option key={dIndex} value={district}>
                          {district}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                disabled
              />
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? "Processing..." : "Proceed to Payment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;