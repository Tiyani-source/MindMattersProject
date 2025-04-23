import React, { useContext } from 'react';
import { MDBBtn } from "mdb-react-ui-kit";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faHeart } from "@fortawesome/free-solid-svg-icons";
import PropTypes from 'prop-types';
import { AppContext } from '../context/AppContext';

const CartItem = ({ item, styles }) => {
  const { removeFromCart, addToWishlist, isLoading } = useContext(AppContext);

  const handleQuantityChange = async (delta) => {
    if (isLoading) return;
    try {
      const newQuantity = Math.max(1, item.quantity + delta);
      await removeFromCart(item.productId);
      await addToCart(item.productId, item.name, item.price, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleMoveToWishlist = async () => {
    if (isLoading) return;
    try {
      await addToWishlist(item.productId, item.name, item.price);
      await removeFromCart(item.productId);
    } catch (error) {
      console.error('Error moving to wishlist:', error);
    }
  };

  const handleDelete = async () => {
    if (isLoading) return;
    try {
      await removeFromCart(item.productId);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  return (
    <tr>
      <td>
        <div style={styles.productCell}>
          <span style={styles.productName}>{item.name}</span>
        </div>
      </td>
      <td>
        <div style={styles.quantityControl}>
          <MDBBtn
            style={styles.quantityBtn}
            onClick={() => handleQuantityChange(-1)}
            disabled={isLoading || item.quantity <= 1}
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
            onClick={() => handleQuantityChange(1)}
            disabled={isLoading}
          >
            +
          </MDBBtn>
        </div>
      </td>
      <td>LKR {item.price * item.quantity}</td>
      <td>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            style={styles.actionBtn}
            onClick={handleMoveToWishlist}
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={faHeart} />
          </button>
          <button
            style={styles.actionBtn}
            onClick={handleDelete}
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </td>
    </tr>
  );
};

CartItem.propTypes = {
  item: PropTypes.shape({
    productId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    quantity: PropTypes.number.isRequired,
  }).isRequired,
  styles: PropTypes.object.isRequired,
};

export default CartItem; 