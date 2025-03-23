import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Table } from 'react-bootstrap';

const AdminProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    image: null,
    stock: 0,
    courier: '',
    colour: '',
    size: '',
    review: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null)

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await axios.get('/api/products');
    setProducts(data);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    setFormData({
      ...formData,
      image: e.target.files[0]
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }

    if (editMode) {
      await axios.put(`/api/products/${currentProductId}`, formDataToSend);
    } else {
      await axios.post('/api/products', formDataToSend);
    }

    setShow(false);
    fetchProducts();
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      image: null,
      stock: product.stock,
      courier: product.courier,
      colour: product.colour,
      size: product.size,
      review: product.review
    });
    setCurrentProductId(product._id);
    setEditMode(true);
    setShow(true);
  };

  const handleDelete = async (productId) => {
    await axios.delete(`/api/products/${productId}`);
    fetchProducts();
  };

  const handleAddProduct = () => {
    setFormData({
      name: '',
      image: null,
      stock: 0,
      courier: '',
      colour: '',
      size: '',
      review: ''
    });
    setEditMode(false);
    setShow(true);
  };

  const handleClose = () => setShow(false);

  return (
    <div>
      <h2>Product Management</h2>
      <Button variant="primary" onClick={handleAddProduct}>Add Product</Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Stock</th>
            <th>Courier</th>
            <th>Colour</th>
            <th>Size</th>
            <th>Review</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product._id}>
              <td>{product.name}</td>
              <td>{product.stock}</td>
              <td>{product.courier}</td>
              <td>{product.colour}</td>
              <td>{product.size}</td>
              <td>{product.review}</td>
              <td>
                <Button variant="warning" onClick={() => handleEdit(product)}>Edit</Button>
                <Button variant="danger" onClick={() => handleDelete(product._id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Edit Product' : 'Add Product'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleFormSubmit}>
            <Form.Group controlId="formName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Enter name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formImage">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                name="image"
                onChange={handleImageChange}
              />
            </Form.Group>

            <Form.Group controlId="formStock">
              <Form.Label>Stock</Form.Label>
              <Form.Control
                type="number"
                name="stock"
                placeholder="Enter stock"
                value={formData.stock}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formCourier">
              <Form.Label>Courier</Form.Label>
              <Form.Control
                type="text"
                name="courier"
                placeholder="Enter courier"
                value={formData.courier}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formColour">
              <Form.Label>Colour</Form.Label>
              <Form.Control
                type="text"
                name="colour"
                placeholder="Enter colour"
                value={formData.colour}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formSize">
              <Form.Label>Size</Form.Label>
              <Form.Control
                type="text"
                name="size"
                placeholder="Enter size"
                value={formData.size}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formReview">
              <Form.Label>Review</Form.Label>
              <Form.Control
                type="text"
                name="review"
                placeholder="Enter review"
                value={formData.review}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              {editMode ? 'Update Product' : 'Add Product'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AdminProductManagement;