import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBBtn,
  MDBContainer,
  MDBTypography,
} from "mdb-react-ui-kit";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const Wishlist = () => {
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState(() => {
    const savedWishlist = localStorage.getItem("wishlist");
    return savedWishlist
      ? JSON.parse(savedWishlist)
      : [
        {
            id: 1,
            name: "Aromatherapy Diffuser & Oil Set",
            price: 799,
          },
          {
            id: 2,
            name: "Noise-Canceling Relaxation Headphones",
            price: 239,
          },
          {
            id: 3,
            name: "Weighted Anxiety Relief Blanket",
            price: 2600,
          },
          {
            id: 4,
            name: "Mindfulness & Reflection Journal",
            price: 1299,
          },
          {
            id: 5,
            name: "Calm Meditation App Annual Subscription",
            price: 899,
          },
          {
            id: 6,
            name: "Essential Oils Trio: Lavender, Eucalyptus & Peppermint",
            price: 699,
          },
          {
            id: 7,
            name: "Sleep Eye Mask with Cooling Gel",
            price: 199,
          },
          {
            id: 8,
            name: "Stress Relief Coloring Book for Adults",
            price: 349,
          }
        ];
  });

  // Save wishlist on change
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Remove from wishlist
  const removeFromWishlist = (id) => {
    const updatedWishlist = wishlist.filter((item) => item.id !== id);
    setWishlist(updatedWishlist);
  };

  // Add to cart & remove from wishlist
  const addToCart = (item) => {
    const savedCart = localStorage.getItem("cart");
    const currentCart = savedCart ? JSON.parse(savedCart) : [];

    // Avoid duplicates (optional, or allow duplicates if you prefer)
    const itemExists = currentCart.find((cartItem) => cartItem.id === item.id);
    if (!itemExists) {
      currentCart.push({ ...item, quantity: 1 }); // Add with quantity: 1
      localStorage.setItem("cart", JSON.stringify(currentCart));
    }

    // Remove from wishlist
    removeFromWishlist(item.id);
  };

  const styles = {
    container: {
      width: "90%",
      maxWidth: "1800px",
      margin: "30px auto",
      textAlign: "center",
      background: "#ffffff",
      borderRadius: "8px",
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
      paddingBottom: "20px",
    },
    header: {
      fontSize: "18px",
      marginTop: "10px",
      marginBottom: "10px",
      color: "#6b7280",
    },
    highlight: {
      color: "#374151",
      fontWeight: "bold",
    },
    table: {
      width: "100%",
      marginTop: "10px",
    },
    th: {
      fontSize: "16px",
      fontWeight: "normal",
      color: "#333",
      borderBottom: "2px solid #e5e7eb",
      textAlign: "left",
      padding: "12px 15px",
    },
    td: {
      padding: "15px",
      textAlign: "left",
    },
    productImage: {
      width: "50px",
      height: "50px",
      borderRadius: "50%",
    },
    stockBadge: {
      fontSize: "14px",
      fontWeight: 500,
    },
    btn: {
      fontSize: "14px",
      padding: "6px 12px",
      marginRight: "5px",
    },
    backBtn: {
      background: "#6c63ff",
      color: "white",
      fontWeight: "normal",
      padding: "8px 16px",
      borderRadius: "6px",
      fontSize: "12px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      margin: "15px auto 0",
      transition: "background 0.3s ease",
    },
    emptyText: {
      fontSize: "16px",
      marginTop: "20px",
      color: "#777",
    },
  };

  return (
    <MDBContainer style={styles.container}>
      <MDBTypography tag="h2" style={styles.header}>
        WISH<span style={styles.highlight}> LIST</span>
      </MDBTypography>

      {wishlist.length === 0 ? (
        <p style={styles.emptyText}>Your wishlist is empty </p>
      ) : (
        <MDBTable align="middle" style={styles.table}>
          <MDBTableHead>
            <tr>
              <th style={styles.th}>Product Name</th>
              <th style={styles.th}>Unit Price</th>
              <th style={styles.th}></th>
              <th style={styles.th}></th>
            </tr>
          </MDBTableHead>
          <MDBTableBody>
            {wishlist.map((item) => (
              <tr key={item.id}>

                <td style={styles.td}>
                  <div className="d-flex align-items-center">
                    
                    <div className="ms-3">
                      <p className="fw-normal mb-1">{item.name}</p>
                    </div>
                  </div>
                </td>

                <td style={styles.td}>
                  <span className="fw-normal">LKR {item.price}</span>
                </td>

                <td style={styles.td}>
                  <span
                    onClick={() => addToCart(item)}
                    style={{
                      color: "blue",
                      fontWeight:300,
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    Add to Cart
                  </span>
                </td>

                <td style={styles.td}>
                  <MDBBtn
                    color="link"
                    rounded
                    size="sm"
                    onClick={() => removeFromWishlist(item.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </MDBBtn>
                </td>

              </tr>
            ))}
          </MDBTableBody>
        </MDBTable>
      )}

      <MDBBtn style={styles.backBtn} onClick={() => navigate("/store")}>
        <FontAwesomeIcon icon={faArrowLeft} /> Back to Store
      </MDBBtn>
    </MDBContainer>
  );
};

export default Wishlist;