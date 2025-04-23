import React, { useContext } from 'react';
import { SupplyManagerContext } from '../../context/SupplyManagerContext';
import { Container, Row, Col, Card, Badge, Button, ListGroup } from 'react-bootstrap';
import { Calendar, Phone, Mail, MapPin, Clock, Award, Briefcase, User } from 'react-feather';

const SupplierProfileDashboard = () => {
  const { supplyManager } = useContext(SupplyManagerContext);

  if (!supplyManager) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading profile data...</p>
        </div>
      </Container>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const StatCard = ({ icon, title, value }) => (
    <Card className="h-100 border-0 shadow-sm hover-shadow transition-all">
      <Card.Body className="d-flex flex-column align-items-center text-center p-3">
        {icon}
        <h6 className="text-muted mt-2 mb-1">{title}</h6>
        <p className="font-weight-bold mb-0 fs-5">{value}</p>
      </Card.Body>
    </Card>
  );

  const ProfileImage = () => {
    const [imageError, setImageError] = React.useState(false);

    if (imageError || !supplyManager.image) {
      return (
        <div 
          className="rounded-circle border border-4 border-white d-flex align-items-center justify-content-center bg-light shadow"
          style={{ width: '150px', height: '150px' }}
        >
          <User size={60} className="text-secondary" />
        </div>
      );
    }

    return (
      <img
        src={`${import.meta.env.VITE_BACKEND_URL}/${supplyManager.image}`}
        alt={supplyManager.name}
        className="rounded-circle border border-4 border-white shadow"
        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
        onError={() => setImageError(true)}
      />
    );
  };

  return (
    <Container className="py-4">
      <Card className="shadow border-0 mb-4 overflow-hidden">
        <div className="bg-primary position-absolute w-100" style={{ height: '100px', top: 0 }}></div>
        <Card.Body className="px-4 pt-5 pb-4">
          <Row className="g-4">
            <Col lg={3} className="text-center">
              <div className="position-relative" style={{ marginTop: '-40px' , marginLeft: "55px"}}>
                <ProfileImage />
                <Badge 
                  bg={supplyManager.available ? 'success' : 'danger'}
                  className="position-absolute top-0 end-0 mt-2 p-2 rounded-pill"
                >
                  {supplyManager.available ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
              <h3 className="mt-3 mb-1">{supplyManager.name}</h3>
              <p className="text-muted mb-2">
                {supplyManager.role} - {supplyManager.department}
              </p>
            </Col>
            <Col lg={9}>
              <h4 className="mb-3 border-bottom pb-2">Overview</h4>
              <Row className="g-3 mb-4">
                <Col xs={6} md={3}>
                  <StatCard 
                    icon={<Clock size={24} className="text-primary" />}
                    title="Experience" 
                    value={`${supplyManager.experience} Years`}
                  />
                </Col>
                <Col xs={6} md={3}>
                  <StatCard 
                    icon={<Calendar size={24} className="text-primary" />}
                    title="Joined" 
                    value={formatDate(supplyManager.joinDate)}
                  />
                </Col>
                <Col xs={6} md={3}>
                  <StatCard 
                    icon={<Award size={24} className="text-primary" />}
                    title="Access Level" 
                    value={supplyManager.accessLevel || 'Standard'}
                  />
                </Col>
              </Row>
              
              <h4 className="mb-3 border-bottom pb-2">Contact Information</h4>
              <Row className="mb-4">
                <Col md={6} className="mb-3">
                  <div className="d-flex align-items-center">
                    <Mail className="text-primary me-2" size={18} />
                    <div>
                      <small className="text-muted d-block">Email</small>
                      <a href={`mailto:${supplyManager.email}`} className="text-decoration-none">
                        {supplyManager.email}
                      </a>
                    </div>
                  </div>
                </Col>
                <Col md={6} className="mb-3">
                  <div className="d-flex align-items-center">
                    <Phone className="text-primary me-2" size={18} />
                    <div>
                      <small className="text-muted d-block">Phone</small>
                      <a href={`tel:${supplyManager.contactNumber}`} className="text-decoration-none">
                        {supplyManager.contactNumber}
                      </a>
                    </div>
                  </div>
                </Col>
                <Col md={12}>
                  <div className="d-flex align-items-center">
                    <MapPin className="text-primary me-2" size={18} />
                    <div>
                      <small className="text-muted d-block">Address</small>
                      <p className="mb-0">{supplyManager.address}</p>
                    </div>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SupplierProfileDashboard;