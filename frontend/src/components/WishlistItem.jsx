import React from 'react';
import { MDBBtn } from 'mdb-react-ui-kit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const WishlistItem = ({ item, onRemove, onAddToCart, styles }) => {
  return (
    <tr>
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
          onClick={() => onAddToCart(item)}
          style={styles.addToCartLink}
        >
          Add to Cart
        </span>
      </td>

      <td style={styles.td}>
        <MDBBtn
          color="link"
          rounded
          size="sm"
          onClick={() => onRemove(item.id)}
        >
          <FontAwesomeIcon icon={faTrash} />
        </MDBBtn>
      </td>
    </tr>
  );
};

export default WishlistItem; 