import React, { useState } from "react";
import Cards from "react-credit-cards-2";
import "react-credit-cards-2/dist/es/styles-compiled.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Card, Button } from "react-bootstrap";
import "../styles/Payment.css";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";


export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order;

  // State for Credit Card Details
  const [paymentDetails, setPaymentDetails] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
    focus: "",
  });

  // Handle Input Change
  const handleChange = (e) => {
    setPaymentDetails({ ...paymentDetails, [e.target.name]: e.target.value });
  };

  // Handle Focus
  const handleFocus = (e) => {
    setPaymentDetails({ ...paymentDetails, focus: e.target.name });
  };

  // Handle Payment Submission
  const handlePayment = (e) => {
    e.preventDefault();
    Swal.fire({
        title: "Order Placed!",
        text: "Your order has been placed successfully 🎉 ",
        icon: "success",
        confirmButtonText: "View My Orders",
        confirmButtonColor: "#3ed0ae",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/my-orders");
        }
      });
  };

  return (
    <Container>
      <div className="payment-header">
        <p>PAY<span className="highlight">MENT</span></p>
      </div>

      <Row className="payment-layout">
        {/* Left Side - Credit Card Preview */}
        <Col md={6} className="payment-card-container">
          <Cards
            number={paymentDetails.cardNumber}
            name={paymentDetails.cardName}
            expiry={paymentDetails.expiry}
            cvc={paymentDetails.cvc}
            focused={paymentDetails.focus}
          />
        </Col>

        {/* Right Side - Payment Form */}
        <Col md={6} className="payment-form-container">
          <Card className="payment-card">
            <Card.Body>
              <Form onSubmit={handlePayment}>
                {/* Cardholder Name */}
                <Form.Group className="mb-3">
                  <Form.Label className="payment-label">Cardholder Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="cardName"
                    value={paymentDetails.cardName}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    required
                    className="payment-input"
                  />
                </Form.Group>

                {/* Card Number */}
                <Form.Group className="mb-3">
                  <Form.Label className="payment-label">Card Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="cardNumber"
                    value={paymentDetails.cardNumber}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    required
                    maxLength="16"
                    className="payment-input"
                  />
                </Form.Group>

                <Row className="mb-3">
                  <Col md={6}>
                    {/* Expiry Date */}
                    <Form.Group>
                      <Form.Label className="payment-label">Expiry Date (MM/YY)</Form.Label>
                      <Form.Control
                        type="text"
                        name="expiry"
                        placeholder="MM/YY"
                        value={paymentDetails.expiry}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        required
                        className="payment-input"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    {/* CVV */}
                    <Form.Group>
                      <Form.Label className="payment-label">CVV</Form.Label>
                      <Form.Control
                        type="text"
                        name="cvc"
                        value={paymentDetails.cvc}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        required
                        maxLength="3"
                        className="payment-input"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Payment Buttons */}
                <div className="payment-buttons">
                  <Button className="go-back-btn" onClick={() => navigate("/checkout")}>
                    Back to Checkout
                  </Button>
                  <Button type="submit" className="pay-now-btn">
                    Pay Now
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}