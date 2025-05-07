import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBTypography,
  MDBSpinner,
} from "mdb-react-ui-kit";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faArrowLeft, faShoppingBag } from "@fortawesome/free-solid-svg-icons";
import WishlistItem from "../components/WishlistItem";
import { styles } from "../styles/WishlistStyles";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Wishlist = () => {
  const navigate = useNavigate();
  const {
    token,
    wishlist,
    getWishlist,
    removeFromWishlist,
    addToCart,
    isLoading,
  } = useContext(AppContext);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchWishlist();
  }, [token]);

  const fetchWishlist = async () => {
    try {
      await getWishlist();
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("Failed to load wishlist");
    }
  };

  const handleAddToCart = async (item) => {
    try {
      // First remove from wishlist
      await removeFromWishlist(item.productId);
      // Then navigate to product details
      navigate(`/product/${item.productId}`, { 
        state: { 
          message: 'Please select color and size before adding to cart',
          fromWishlist: true // Add this flag to indicate coming from wishlist
        } 
      });
    } catch (error) {
      console.error("Error handling add to cart:", error);
      toast.error("Failed to process your request");
    }
  };

  const handleRemove = async (productId) => {
    console.log("Clicked to remove:", productId);
    try {
      await removeFromWishlist(productId);
      // Refresh wishlist after successful removal
      await fetchWishlist();
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error(error.message || "Failed to remove item from wishlist");
    }
  };

  return (
    <section style={styles.container}>
      <div style={styles.header}>
        <MDBTypography tag="h2">
          WISH<span style={styles.highlight}>LIST</span>
        </MDBTypography>
      </div>

      {isLoading ? (
        <div style={styles.emptyWishlist}>
          <MDBSpinner grow size="lg" style={{ marginBottom: "1rem" }} />
          <p style={styles.emptyWishlistText}>Loading your wishlist...</p>
        </div>
      ) : wishlist.items.length === 0 ? (
        <div style={styles.emptyWishlist}>
          <p style={styles.emptyWishlistText}>
            <FontAwesomeIcon icon={faHeart} /> Your wishlist is empty
          </p>
          <button
            style={styles.continueBtn}
            onClick={() => navigate("/store")}
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={faShoppingBag} /> Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <MDBTable align="middle" style={styles.table}>
            <MDBTableHead>
              <tr>
                <th style={styles.tableHeader}>Product</th>
                <th style={styles.tableHeader}>Price</th>
                <th style={styles.tableHeader}>Actions</th>
                <th style={styles.tableHeader}>Delete</th>
              </tr>
            </MDBTableHead>
            <MDBTableBody>
              {wishlist.items.map((item) => (
                <WishlistItem
                  key={`${item.productId}-${item.color || 'no-color'}-${item.size || 'no-size'}`}
                  item={item}
                  styles={styles}
                  onRemove={handleRemove}
                  onAddToCart={handleAddToCart}
                  isLoading={isLoading}
                />
              ))}
            </MDBTableBody>
          </MDBTable>

          <div style={styles.actions}>
            <button
              style={styles.continueBtn}
              onClick={() => navigate("/store")}
              disabled={isLoading}
            >
              <FontAwesomeIcon icon={faArrowLeft} /> Continue Shopping
            </button>
          </div>
        </>
      )}
    </section>
  );
};

export default Wishlist;