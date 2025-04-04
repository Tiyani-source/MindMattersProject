import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBInput,
  MDBBtn,
} from "mdb-react-ui-kit";

export default function Checkout() {
  const navigate = useNavigate();

    const {
      createOrder
    } = useContext(AppContext);

  // State for user details
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    postalCode: "",
    country: "Sri Lanka", 
    district: "",
  });

    // Handle input change
    const handleChange = (e) => {
      setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    // // Email validation 
    // const isValidEmail = (email) => {
    //   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    // };

    // // phone number validation: 10 digits, starts with 0
    // const isValidPhone = (phone) => {
    //   return /^0\d{9}$/.test(phone);
    // };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Stop default form submission
  
  //   // email validation
  // if (!isValidEmail(userData.email)) {
  //   alert("Invalid email address.");
  //   return; 
  // }

  // // phone validation
  // if (!isValidPhone(userData.phone)) {
  //   alert("Invalid phone number. Must be 10 digits and start with 0.");
  //   return; 
  // }
  
    
    const sampleOrder = {
      orderId: "ORD" + Date.now().toString(),
      userId: "67e103c65fcd6a646d13c971",
      products: 2,
      shippingCost: 500,
      totalAmount: 5000,
      shippingInfo: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        apartment: userData.apartment,
        city: userData.city,
        postalCode: userData.postalCode,
        district: userData.district,
        country: userData.country
      },
      items: [
        {
          name: "Weighted Anxiety Relief Blanket",
          quantity: 2,
          price: 2600
        },
        {
          name: "Mindfulness & Reflection Journal",
          quantity: 1,
          price: 2400
        }
      ]
    };
  
    createOrder(sampleOrder);
    navigate("/payment", { state: { order: sampleOrder } });
  };
  
  const styles = {
    checkoutHeader: {
      textAlign: "center",
      fontSize: "18px",
      marginTop: "20px",
      color: "#6b7280",
    },
    highlight: {
      color: "#374151",
      fontWeight: "bold",
    },
    checkoutLayout: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "space-between",
      padding: "20px",
      alignItems: "flex-start",
      marginTop: "30px",
    },
    checkoutFormContainer: {
      flex: 1,
      maxWidth: "100%",
    },
    checkoutCard: {
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "2px 2px 8px rgba(0, 0, 0, 0.1)",
      backgroundColor: "#fff",
    },
    checkoutInput: {
      width: "100%",
      padding: "14px",
      border: "1px solid #d1d5db",
      borderRadius: "5px",
      fontSize: "12px",
      fontWeight: 300,
      color: "#374151",
      backgroundColor: "white",
      transition: "all 0.2s ease-in-out",
    },
    checkoutLabel: {
      display: "block",
      fontSize: "12px",
      fontWeight: 400,
      color: "#6b7280",
      marginBottom: "5px",
    },
    checkoutButtons: {
      display: "flex",
      justifyContent: "space-between",
      gap: "15px",
      marginTop: "20px",
    },
    goBackBtn: {
      backgroundColor: "white",
      color: "#6c63ff",
      padding: "14px 25px",
      borderRadius: "12px",
      width: "50%",
      border: "1px solid #6c63ff",
      fontSize: "12px",
      transition: "background 0.3s ease, color 0.3s ease",
    },
    checkoutBtn: {
      backgroundColor: "#6c63ff",
      color: "white",
      fontWeight: "normal",
      padding: "14px 25px",
      borderRadius: "12px",
      width: "50%",
      border: "none",
      fontSize: "12px",
      transition: "background 0.3s ease",
    }
  };
  return (
    <MDBContainer>
      {/* Checkout Page Header */}
      <div style={styles.checkoutHeader}>
        <p>CHECK<span style={styles.highlight}>OUT</span></p>
      </div>

      <MDBRow style={styles.checkoutLayout}>
        <MDBCol md="6" style={styles.checkoutFormContainer}>
          <MDBCard style={styles.checkoutCard}>
            <MDBCardBody>
              <form onSubmit={handleSubmit}>
                {/* First Name & Last Name */}
                <MDBRow style={{ marginBottom: "15px" }}>
                  <MDBCol md="6">
                    <label style={styles.checkoutLabel}>First Name</label>
                    <MDBInput
                      type="text"
                      name="firstName"
                      value={userData.firstName}
                      onChange={handleChange}
                      style={styles.checkoutInput}
                    />
                  </MDBCol>
                  <MDBCol md="6">
                    <label style={styles.checkoutLabel}>Last Name</label>
                    <MDBInput
                      type="text"
                      name="lastName"
                      value={userData.lastName}
                      onChange={handleChange}
                      style={styles.checkoutInput}
                    />
                  </MDBCol>
                </MDBRow>

                <label style={styles.checkoutLabel}>Email</label>
                <MDBInput
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                  required
                  style={styles.checkoutInput}
                />

                <label style={styles.checkoutLabel}>Address</label>
                <MDBInput
                  type="text"
                  name="address"
                  value={userData.address}
                  onChange={handleChange}
                  required
                  style={styles.checkoutInput}
                />

                <label style={styles.checkoutLabel}>
                  Apartment, Suite, etc. (optional)
                </label>
                <MDBInput
                  type="text"
                  name="apartment"
                  value={userData.apartment}
                  onChange={handleChange}
                  style={styles.checkoutInput}
                />

                <MDBRow style={{ marginBottom: "15px" }}>
                  <MDBCol md="6">
                    <label style={styles.checkoutLabel}>City</label>
                    <MDBInput
                      type="text"
                      name="city"
                      value={userData.city}
                      onChange={handleChange}
                      required
                      style={styles.checkoutInput}
                    />
                  </MDBCol>
                  <MDBCol md="6">
                    <label style={styles.checkoutLabel}>Postal Code (optional)</label>
                    <MDBInput
                      type="text"
                      name="postalCode"
                      value={userData.postalCode}
                      onChange={handleChange}
                      style={styles.checkoutInput}
                    />
                  </MDBCol>
                </MDBRow>

                <label style={styles.checkoutLabel}>Province</label>
                <select
                  style={styles.checkoutInput}
                  name="district"
                  value={userData.district}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Select Province
                  </option>
                  <option value="Central">Central Province</option>
                    <option value="Eastern">Eastern Province</option>
                    <option value="North Central">North Central Province</option>
                    <option value="Northern">Northern Province</option>
                    <option value="North Western">North Western Province</option>
                    <option value="Sabaragamuwa">Sabaragamuwa Province</option>
                    <option value="Southern">Southern Province</option>
                    <option value="Uva">Uva Province</option>
                    <option value="Western">Western Province</option>
                </select>

                <label style={styles.checkoutLabel}>Phone</label>
                <MDBInput
                  type="tel"
                  name="phone"
                  value={userData.phone}
                  onChange={handleChange}
                  required
                  style={styles.checkoutInput}
                />

                           
      <div className="checkout-buttons">
        <MDBBtn style={styles.goBackBtn} onClick={() => navigate("/cart")}>
           Go back to Cart
        </MDBBtn>
        <MDBBtn 
        style={styles.checkoutBtn} 
        type="Submit" 
        onClick={async (e) => {
          e.preventDefault();
          const createdOrder = await handleSubmit(e); 
          navigate("/payment", { state: { order: createdOrder } });
        }}
      >
        Place Order
      </MDBBtn>
      </div>
              </form>
            </MDBCardBody>
          </MDBCard>
        </MDBCol> 

      </MDBRow>
     
    </MDBContainer>
  );
}