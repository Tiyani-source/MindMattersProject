import React, { useContext } from 'react';
import { MDBBtn } from "mdb-react-ui-kit";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faHeart } from "@fortawesome/free-solid-svg-icons";
import PropTypes from 'prop-types';
import { AppContext } from '../context/AppContext';

const CartItem = ({ item, styles }) => {
  const { removeFromCart, addToWishlist, updateCartItemQuantity, isLoading } = useContext(AppContext);

  const handleQuantityChange = async (delta) => {
    if (isLoading) return;
    
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return; // Prevent quantity from going below 1

    try {
      await updateCartItemQuantity(item.productId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleMoveToWishlist = async () => {
    if (isLoading) return;
    try {
      await addToWishlist({
        productId: item.productId,
        name: item.name,
        price: item.price,
        color: item.color,
        size: item.size
      });
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
    <tr style={styles.cartItemRow}>
      <td style={styles.productCell}>
        <div style={styles.productInfo}>
          <span style={styles.productName}>{item.name}</span>
        </div>
      </td>
      <td style={styles.attributesCell}>
        <div style={styles.attributes}>
          {item.color && (
            <div style={styles.attributeContainer}>
              Color: 
              <div style={{ ...styles.colorBlock, backgroundColor: item.color }} />
            </div>
          )}
          {item.size && (
            <div style={styles.attributeContainer}>
              Size: 
              <span style={styles.attributeValue}>{item.size}</span>
            </div>
          )}
        </div>
      </td>
      <td style={styles.quantityCell}>
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
      <td style={styles.priceCell}>
        <div style={styles.priceContainer}>
          <span style={styles.priceLabel}>Total</span>
          <span style={styles.priceValue}>LKR {item.price * item.quantity}</span>
        </div>
      </td>
      <td style={styles.actionsCell}>
        <div style={styles.actionsContainer}>
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
    color: PropTypes.string,
    size: PropTypes.string,
  }).isRequired,
  styles: PropTypes.object.isRequired,
};

export default CartItem; 