import React, { useState, useEffect, useContext } from "react";
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
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import WishlistItem from "../components/WishlistItem";
import { styles } from "../styles/WishlistStyles";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const Wishlist = () => {
  const navigate = useNavigate();
  const { token, wishlist, getWishlist, removeFromWishlist } = useContext(AppContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [token]);

  const fetchWishlist = async () => {
    try {
      await getWishlist();
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove item from wishlist');
    }
  };

  const addToCart = async (item) => {
    try {
      const response = await axios.post(`${backendUrl}/api/cart`, 
        { ...item, quantity: 1 }, 
        { headers: { token } }
      );
      if (response.data.success) {
        handleRemoveFromWishlist(item.id);
        toast.success('Item added to cart');
      } else {
        toast.error(response.data.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <MDBContainer style={styles.container}>
      <MDBTypography tag="h2" style={styles.header}>
        WISH<span style={styles.highlight}> LIST</span>
      </MDBTypography>

      {wishlist.length === 0 ? (
        <p style={styles.emptyText}>Your wishlist is empty</p>
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
              <WishlistItem
                key={item.id}
                item={item}
                onRemove={handleRemoveFromWishlist}
                onAddToCart={addToCart}
                styles={styles}
              />
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