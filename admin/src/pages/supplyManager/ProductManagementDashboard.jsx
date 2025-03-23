import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Row, Col, Modal, Button, Form, 
  Card, Badge, Spinner, Alert, InputGroup, FormControl, Dropdown
} from 'react-bootstrap';
import './AdminProductManagement.css'; // We'll modify this file for card styling

const AdminProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
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
  const [currentProductId, setCurrentProductId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Base URL from .env file
  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_URL}/api/products`);
      console.log('API response:', data);
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error.response || error.message);
      setError('Failed to load products. Please try again later.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      image: file
    });

    // Create preview URL for the selected image
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    for (const key in formData) {
      if (formData[key] !== null) {
        formDataToSend.append(key, formData[key]);
      }
    }

    setLoading(true);
    try {
      if (editMode) {
        await axios.put(`${API_URL}/api/products/${currentProductId}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post(`${API_URL}/api/products`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setShow(false);
      fetchProducts();
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error.response || error.message);
      setError('Failed to save product. Please check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      image: null,
      stock: product.stock,
      courier: product.courier,
      colour: product.colour,
      size: product.size,
      review: product.desc
    });
    setCurrentProductId(product._id);
    setEditMode(true);
    setShow(true);
    
    // Set image preview if product has an image
    if (product.image) {
      setImagePreview(`${API_URL}/${product.image}`);
    } else {
      setImagePreview(null);
    }
  };

  const confirmDelete = (productId) => {
    setProductToDelete(productId);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/api/products/${productToDelete}`);
      fetchProducts();
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error.response || error.message);
      setError('Failed to delete product. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    resetForm();
    setEditMode(false);
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      image: null,
      stock: 0,
      courier: '',
      colour: '',
      size: '',
      review: ''
    });
    setCurrentProductId(null);
    setImagePreview(null);
  };

  const handleSort = (field) => {
    const newDirection = 
      field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    
    setSortField(field);
    setSortDirection(newDirection);
    
    // Sort the products array
    const sortedProducts = [...products].sort((a, b) => {
      if (a[field] < b[field]) return newDirection === 'asc' ? -1 : 1;
      if (a[field] > b[field]) return newDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setProducts(sortedProducts);
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.courier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.colour.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get stock status for badge coloring
  const getStockStatus = (stock) => {
    if (stock > 10) return "success";
    if (stock > 0) return "warning";
    return "danger";
  };

  // Render product grid view
  const renderProductGrid = () => {
    if (filteredProducts.length === 0) {
      return (
        <div className="text-center my-5 py-5">
          <div className="empty-products">
            <div className="empty-icon">📦</div>
            <h4 className="mt-3">{searchTerm ? 'No products match your search criteria' : 'No products available'}</h4>
            <p className="text-muted">Try adding a new product or adjusting your search.</p>
          </div>
        </div>
      );
    }

    return (
      <Row xs={1} sm={2} md={3} lg={4} className="g-4 mt-2">
        {filteredProducts.map(product => (
          <Col key={product._id}>
            <Card className="product-card h-100 shadow-sm border-0">
              <div className="product-card-image-container">
                {product.image ? (
                  <Card.Img 
                    variant="top" 
                    src={`${API_URL}/${product.image}`}
                    onError={(e) => {e.target.src = '/placeholder-image.png'}}
                    className="product-card-image"
                  />
                ) : (
                  <div className="product-card-no-image">
                    <span>No Image</span>
                  </div>
                )}
                <Badge 
                  bg={getStockStatus(product.stock)}
                  className="stock-badge-overlay"
                >
                  {product.stock} in stock
                </Badge>
              </div>
              <Card.Body className="d-flex flex-column">
                <Card.Title className="product-title">{product.name}</Card.Title>
                <div className="product-details mb-3">
                  <div className="product-detail-item">
                    <span className="detail-label">Courier:</span> {product.courier}
                  </div>
                  <div className="product-detail-item">
                    <span className="detail-label">Size:</span> {product.size}
                  </div>
                  <div className="product-detail-item d-flex align-items-center">
                    <span className="detail-label">Colour:</span>
                    <span 
                      className="colour-dot me-1"
                      style={{ 
                        backgroundColor: product.colour.toLowerCase(),
                        display: /^#([0-9A-F]{3}){1,2}$/i.test(product.colour) ? 'inline-block' : 'none'
                      }}
                    ></span>
                    {product.colour}
                  </div>
                </div>
                <Card.Text className="product-review text-truncate mb-3">
                  {product.desc}
                </Card.Text>
                <div className="mt-auto pt-2 border-top">
                  <div className="d-flex justify-content-between">
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="flex-grow-1 me-2" 
                      onClick={() => handleEdit(product)}
                    >
                      <span className="me-1">✏️</span> Edit
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      className="flex-grow-1" 
                      onClick={() => confirmDelete(product._id)}
                    >
                      <span className="me-1">🗑️</span> Delete
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  // Render product list view (for reference, similar to original table)
  const renderProductList = () => {
    return (
      <div className="table-responsive">
        <table className="table table-hover product-table">
          <thead className="table-light">
            <tr>
              <th onClick={() => handleSort('name')} className="sortable-header">
                Name
                <span className={`sort-indicator ms-1 ${sortField === 'name' ? 'd-inline' : 'd-none'}`}>
                  {sortDirection === 'asc' ? '▲' : '▼'}
                </span>
              </th>
              <th onClick={() => handleSort('stock')} className="sortable-header">
                Stock
                <span className={`sort-indicator ms-1 ${sortField === 'stock' ? 'd-inline' : 'd-none'}`}>
                  {sortDirection === 'asc' ? '▲' : '▼'}
                </span>
              </th>
              <th onClick={() => handleSort('courier')} className="sortable-header">
                Courier
              </th>
              <th onClick={() => handleSort('colour')} className="sortable-header">
                Colour
              </th>
              <th onClick={() => handleSort('size')} className="sortable-header">
                Size
              </th>
              <th>Review</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <tr key={product._id}>
                  <td className="align-middle">
                    <div className="d-flex align-items-center">
                      {product.image ? (
                        <div className="product-thumbnail me-2">
                          <img 
                            src={`${API_URL}/${product.image}`} 
                            alt={product.name}
                            onError={(e) => {e.target.src = '/placeholder-image.png'}}
                          />
                        </div>
                      ) : (
                        <div className="product-thumbnail me-2 no-image">
                          <span>No Img</span>
                        </div>
                      )}
                      <span className="product-name">{product.name}</span>
                    </div>
                  </td>
                  <td className="align-middle">
                    <Badge 
                      bg={getStockStatus(product.stock)}
                      className="stock-badge"
                    >
                      {product.stock}
                    </Badge>
                  </td>
                  <td className="align-middle">{product.courier}</td>
                  <td className="align-middle">
                    <div className="d-flex align-items-center">
                      <span 
                        className="colour-preview me-2" 
                        style={{ 
                          backgroundColor: product.colour.toLowerCase(), 
                          display: /^#([0-9A-F]{3}){1,2}$/i.test(product.colour) ? 'block' : 'none'
                        }}
                      ></span>
                      {product.colour}
                    </div>
                  </td>
                  <td className="align-middle">{product.size}</td>
                  <td className="align-middle text-truncate" style={{maxWidth: "200px"}}>
                    {product.desc}
                  </td>
                  <td className="align-middle text-center">
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="action-btn me-2" 
                      onClick={() => handleEdit(product)}
                    >
                      ✏️ Edit
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      className="action-btn" 
                      onClick={() => confirmDelete(product._id)}
                    >
                      🗑️ Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  {searchTerm ? 'No products match your search criteria' : 'No products available'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Container fluid className="admin-products-container py-4">
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
            <h2 className="m-0 mb-3 mb-md-0">
              <span className="icon-box me-2">📦</span>
              Product Management
            </h2>
            <div className="d-flex gap-2">
              <Button 
                variant="outline-secondary" 
                className="view-toggle-btn"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? (
                  <><span className="me-2">📋</span>List View</>
                ) : (
                  <><span className="me-2">🔳</span>Grid View</>
                )}
              </Button>
              <Button 
                variant="primary" 
                className="d-flex align-items-center" 
                onClick={handleAddProduct}
              >
                <span className="me-2">+</span>
                Add Product
              </Button>
            </div>
          </div>
          
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          <div className="mb-4">
            <Row className="align-items-center g-3">
              <Col md={9}>
                <InputGroup>
                  <InputGroup.Text className="bg-white">
                    🔍
                  </InputGroup.Text>
                  <FormControl
                    placeholder="Search by name, courier, or color..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-start-0"
                  />
                </InputGroup>
              </Col>
              <Col md={3}>
                <Dropdown>
                  <Dropdown.Toggle variant="outline-secondary" className="w-100">
                    <span className="me-2">🔄</span>
                    Sort by: {sortField.charAt(0).toUpperCase() + sortField.slice(1)} ({sortDirection === 'asc' ? 'A-Z' : 'Z-A'})
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => handleSort('name')}>
                      <span className={sortField === 'name' ? 'fw-bold' : ''}>Name</span>
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleSort('stock')}>
                      <span className={sortField === 'stock' ? 'fw-bold' : ''}>Stock</span>
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleSort('courier')}>
                      <span className={sortField === 'courier' ? 'fw-bold' : ''}>Courier</span>
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleSort('colour')}>
                      <span className={sortField === 'colour' ? 'fw-bold' : ''}>Colour</span>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
            </Row>
          </div>
          
          {loading && !show ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading products...</span>
              </Spinner>
              <p className="mt-2">Loading products...</p>
            </div>
          ) : (
            viewMode === 'grid' ? renderProductGrid() : renderProductList()
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Product Modal */}
      <Modal 
        show={show} 
        onHide={handleClose}
        backdrop="static"
        size="lg"
        centered
        className="product-modal"
      >
        <Modal.Header closeButton className="border-bottom">
          <Modal.Title>
            <span className="me-2">{editMode ? '✏️' : '➕'}</span>
            {editMode ? 'Edit Product' : 'Add New Product'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col md={7}>
                <Form.Group controlId="formName" className="mb-3">
                  <Form.Label>Product Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group controlId="formStock" className="mb-3">
                      <Form.Label>Stock Quantity</Form.Label>
                      <Form.Control
                        type="number"
                        name="stock"
                        placeholder="Enter stock quantity"
                        value={formData.stock}
                        onChange={handleInputChange}
                        required
                        min="0"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="formCourier" className="mb-3">
                      <Form.Label>Courier Service</Form.Label>
                      <Form.Control
                        type="text"
                        name="courier"
                        placeholder="Enter courier service"
                        value={formData.courier}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group controlId="formColour" className="mb-3">
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
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="formSize" className="mb-3">
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
                  </Col>
                </Row>

                <Form.Group controlId="formReview" className="mb-3">
                  <Form.Label>Product Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="desc"
                    placeholder="Enter product description or review"
                    value={formData.desc}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={5}>
                <Form.Group controlId="formImage" className="mb-3">
                  <Form.Label>Product Image</Form.Label>
                  <div className="custom-file-upload">
                    <div 
                      className={`image-preview-container mb-3 ${imagePreview ? 'has-image' : ''}`}
                      onClick={() => document.getElementById('imageInput').click()}
                    >
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="image-preview" />
                      ) : (
                        <div className="image-placeholder">
                          <div className="placeholder-icon">🖼️</div>
                          <p className="mt-2">Click to select an image</p>
                        </div>
                      )}
                    </div>
                    <Form.Control
                      type="file"
                      id="imageInput"
                      name="image"
                      onChange={handleImageChange}
                      accept="image/*"
                      className="d-none"
                    />
                    <Button 
                      variant="outline-secondary" 
                      className="w-100"
                      onClick={() => document.getElementById('imageInput').click()}
                    >
                      <span className="me-2">🖼️</span>
                      {editMode ? 'Change Image' : 'Select Image'}
                    </Button>
                    {editMode && (
                      <Form.Text className="text-muted">
                        Leave blank to keep existing image
                      </Form.Text>
                    )}
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="outline-secondary" onClick={handleClose} className="me-2">
                <span className="me-1">❌</span> Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="me-1">💾</span>
                    {editMode ? 'Update Product' : 'Add Product'}
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        show={showDeleteConfirm} 
        onHide={() => setShowDeleteConfirm(false)}
        backdrop="static"
        centered
        size="sm"
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this product? This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                Deleting...
              </>
            ) : (
              'Yes, Delete'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminProductManagement;