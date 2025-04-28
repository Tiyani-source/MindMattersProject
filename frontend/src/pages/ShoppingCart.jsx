import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBTypography,
} from "mdb-react-ui-kit";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import CartItem from "../components/CartItem";
import { styles } from "../styles/ShoppingCartStyles";
import { AppContext } from "../context/AppContext";

const ShoppingCart = () => {
  const navigate = useNavigate();
  const { 
    token, 
    cart, 
    getCart, 
    clearCart, 
    isLoading 
  } = useContext(AppContext);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [token]);

  const fetchCart = async () => {
    try {
      await getCart();
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart');
    }
  };


  const calculateTotal = () => {
    return cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getShippingCost = () => {
    return cart.shippingCost || 500; // Default to 500 if not set
  };

  const calculateGrandTotal = () => {
    return calculateTotal() + getShippingCost();
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      toast.warning("Your cart is empty");
      return;
    }
    navigate("/checkout");
  };

  return (
    <section style={styles.container}>
      <div style={styles.header}>
        <MDBTypography tag="h2">
          SHOPPING <span style={styles.highlight}>CART</span>
        </MDBTypography>
      </div>

      {cart.items.length === 0 ? (
        <div style={styles.emptyCart}>
          <p style={styles.emptyCartText}>
            <FontAwesomeIcon icon={faShoppingCart} /> Your cart is empty
          </p>
          <button
            style={styles.continueBtn}
            onClick={() => navigate("/store")}
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <MDBTable align="middle" style={styles.table}>
            <MDBTableHead>
              <tr>
                <th style={styles.tableHeader}>Product</th>
                <th style={styles.tableHeader}>Attributes</th>
                <th style={styles.tableHeader}>Quantity</th>
                <th style={styles.tableHeader}>Price</th>
                <th style={styles.tableHeader}>Actions</th>
              </tr>
            </MDBTableHead>
            <MDBTableBody>
              {cart.items.map((item) => (
                <CartItem
                  key={item.productId}
                  item={item}
                  styles={styles}
                />
              ))}
            </MDBTableBody>
          </MDBTable>

          <div style={styles.totalBox}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '15px', 
              width: '100%', 
              maxWidth: '100%',
              padding: '20px',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '8px 0'
              }}>
                <span style={{...styles.totalLabel, fontSize: '16px'}}>Subtotal:</span>
                <span style={{...styles.totalAmount, fontSize: '16px'}}>LKR {calculateTotal()}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '8px 0'
              }}>
                <span style={{...styles.totalLabel, fontSize: '16px'}}>Shipping Cost:</span>
                <span style={{...styles.totalAmount, fontSize: '16px'}}>LKR {getShippingCost()}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderTop: '2px solid #e9ecef',
                paddingTop: '15px',
                marginTop: '5px'
              }}>
                <span style={{
                  ...styles.totalLabel, 
                  fontWeight: 'bold',
                  fontSize: '18px',
                  color: '#2c3e50'
                }}>Total:</span>
                <span style={{
                  ...styles.totalAmount, 
                  fontWeight: 'bold',
                  fontSize: '18px',
                  color: '#2c3e50'
                }}>LKR {calculateGrandTotal()}</span>
              </div>
            </div>
          </div>

          <div style={styles.actions}>
            <button
              style={styles.continueBtn}
              onClick={() => navigate("/store")}
              disabled={isLoading}
            >
              <FontAwesomeIcon icon={faArrowLeft} /> Continue Shopping
            </button>
            <button
              style={styles.checkoutBtn}
              onClick={handleCheckout}
              disabled={isLoading}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </section>
  );
};

export default ShoppingCart; 