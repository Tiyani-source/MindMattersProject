import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBBtn,
  MDBCard,
  MDBCardBody,
  MDBTypography,
} from "mdb-react-ui-kit";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faHeart, faShoppingCart, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function ShoppingCart() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart
      ? JSON.parse(savedCart)
      : [
        {
            id: 3,
            name: "Weighted Anxiety Relief Blanket",
            price: 1229,
            quantity : 2,
          },
          {
            id: 4,
            name: "Mindfulness & Reflection Journal",
            price: 2530,
            quantity : 3,
          },
          {
            id: 5,
            name: "Herbal Chamomile Tea Set",
            price: 1900,
            quantity: 1,
          },
          {
            id: 6,
            name: "Desktop Zen Sand Garden",
            price: 4200,
            quantity: 1,
          },
          {
            id: 7,
            name: "Guided Affirmation Card Deck",
            price: 1500,
            quantity: 2,
          },
          {
            id: 8,
            name: "Acupressure Mat & Pillow Set",
            price: 8900,
            quantity: 1,
          }
        ];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const handleQuantityChange = (id, delta) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const moveToWishlist = (id) => {
    const itemToMove = cartItems.find((item) => item.id === id);
    if (itemToMove) {
      let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      wishlist.push(itemToMove);
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
      toast.success("Item moved to Wishlist!", { position: "top-right" });
    }
  };

  const handleDeleteItem = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
    toast.error("Item removed from cart", { position: "top-right" });
  };



  const styles = {
    container: {
      width: "100%",
      maxWidth: "2000px",
      margin: "30px auto",
      textAlign: "center",
      background: "#ffffff",
      borderRadius: "8px",
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
      padding: "20px",
    },
    header: {
      textAlign: "center",
      fontSize: "18px",
      marginTop: "10px",
      marginBottom: "10px",
      color: "#6b7280",
    },
    highlight: {
      color: "#374151",
      fontWeight: "bold",
    },
    image: {
      width: "70px",
      height: "70px",
      objectFit: "contain",
      marginRight: "10px",
      borderRadius: "5px",
    },
    quantityControl: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "5px 10px",
      justifyContent: "center",
    },
    quantityBtn: {
      color: "#000",
      fontSize: "16px",
      fontWeight: "normal",
      borderRadius: "6px",
      width: "32px",
      height: "32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "none",
      cursor: "pointer",
    },
    quantityInput: {
      width: "35px",
      textAlign: "center",
      border: "1px solid #ccc",
      borderRadius: "5px",
      fontSize: "14px",
      padding: "5px",
      outline: "none",
    },
    
    
    totalBox: {
      backgroundColor: "#e5e7eb",
      padding: "12px",
      borderRadius: "8px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: "14px",
      fontWeight: "600",
      boxShadow: "1px 1px 5px rgba(0, 0, 0, 0.1)",
      marginTop: "15px",
    },
    actions: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "15px",
      gap: "10px",
    },
    continueBtn: {
      background: "transparent",
      color: "#6c63ff",
      fontWeight: "normal",
      padding: "14px 25px",
      borderRadius: "12px",
      fontSize: "12px",
      border: "2px solid #6c63ff",
      width: "100%",
    },
    checkoutBtn: {
      background: "#6c63ff",
      color: "#fff",
      fontWeight: "normal",
      padding: "12px 16px",
      borderRadius: "8px",
      fontSize: "12px",
      width: "100%",
    },
  };

  return (
    <section style={styles.container}>
      <div style={styles.header}>
        <MDBTypography tag="h2">
          SHOPPING <span style={styles.highlight}>CART</span>
        </MDBTypography>
      </div>

      <MDBCardBody>
        <MDBTypography tag="h5" className="mb-4">
          Your Products
        </MDBTypography>

        {cartItems.length === 0 ? (
          <div>
            <p style={{ color: "#6b7280", fontSize: "16px" }}>
              <FontAwesomeIcon icon={faShoppingCart} /> Cart is empty
            </p>
            <button
              style={styles.checkoutBtn}
              onClick={() => navigate("/store")}
            >
              <FontAwesomeIcon icon={faArrowLeft} /> Go Back to Shopping
            </button>
          </div>
        ) : (
          <MDBTable align="middle" style={{ tableLayout: "fixed", width: "100%" }}>
            <MDBTableHead>
              <tr>
                <th style={{ fontWeight: "normal" }}>Product</th>
                <th style={{ fontWeight: "normal" }}>Quantity</th>
                <th style={{ fontWeight: "normal" }}>Price</th>
                <th></th>
              </tr>
            </MDBTableHead>
            <MDBTableBody>
              {cartItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td>
                    <div style={styles.quantityControl}>
                      <MDBBtn
                        style={styles.quantityBtn}
                        onClick={() => handleQuantityChange(item.id, -1)}
                      >
                        -
                      </MDBBtn>
                      <input
                        type="number"
                        value={item.quantity}
                        readOnly
                        style={styles.quantityInput}
                      />
                      <MDBBtn
                        style={styles.quantityBtn}
                        onClick={() => handleQuantityChange(item.id, 1)}
                      >
                        +
                      </MDBBtn>
                    </div>
                  </td>
                  <td>LKR {item.price}</td>
                  <td>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <MDBBtn size="sm" onClick={() => moveToWishlist(item.id)}>
                      <FontAwesomeIcon icon={faHeart} />
                    </MDBBtn>
                    <MDBBtn size="sm" onClick={() => handleDeleteItem(item.id)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </MDBBtn>
                  </div>
                  </td>
                </tr>
              ))}
            </MDBTableBody>
          </MDBTable>
        )}

        

        <div style={styles.totalBox}>
          <MDBTypography tag="h5">Total:</MDBTypography>
          <MDBTypography tag="h5">
            LKR{" "}
            {cartItems.reduce(
              (total, item) => total + item.price * item.quantity,
              0
            )}
          </MDBTypography>
        </div>

        <div style={styles.actions}>
          <MDBBtn style={styles.continueBtn} onClick={() => navigate("/store")}>
            Continue Shopping
          </MDBBtn>
          <MDBBtn style={styles.checkoutBtn} onClick={() => navigate("/checkout")}>
            Checkout
          </MDBBtn>
        </div>
      </MDBCardBody>

      <ToastContainer />
    </section>
  );
} 