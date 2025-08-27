# MindMatters - Comprehensive Mental Health Platform

![MindMatters Logo](https://img.shields.io/badge/MindMatters-Mental%20Health%20Platform-blue?style=for-the-badge&logo=heart)

> **Academic Project** - Year 2 Semester 2 ITP (Information Technology Project) Module

A comprehensive MERN stack platform designed to bridge the gap between mental health professionals and patients, with integrated e-commerce capabilities for mental health products and real-time communication features. This project was developed as part of our academic curriculum to demonstrate full-stack development skills and real-world application of modern web technologies.

## 🎯 Project Overview

MindMatters is a full-stack healthcare platform that provides:

- **Mental Health Services**: Connect patients with therapists, doctors, and mental health professionals
- **E-commerce Integration**: Purchase mental health products, self-care kits, and wellness items
- **Real-time Communication**: Chat system for patient-therapist communication
- **Multi-role Management**: Admin, Doctor, Therapist, Student, Patient, and Supply Manager portals
- **Appointment Scheduling**: Seamless booking and management system
- **Payment Processing**: Integrated payment gateways (Razorpay)
- **Order Management**: Complete order lifecycle management with delivery tracking
- **Notification System**: Real-time notifications for order updates and system alerts
- **Analytics Dashboard**: Comprehensive insights and reporting

## 🏗️ Architecture

The project follows a modular architecture with separate frontend applications for different user roles:

```
MindMattersProject/
├── frontend/          # Main patient/user interface
├── admin/            # Admin dashboard
├── backend/          # Express.js API server
└── MindConnect/      # Real-time chat application
```

## 🛠️ Technologies Used

### Core Stack
- **MERN Stack** - MongoDB, Express.js, React.js, Node.js

### Backend Technologies
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication & Authorization
- **Socket.io** - Real-time communication
- **Multer** - File upload handling
- **Cloudinary** - Cloud image storage
- **Razorpay** - Payment processing
- **Nodemailer/SendGrid** - Email services
- **Google APIs** - Calendar integration

### Frontend Technologies
- **React.js** - UI library
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js/Recharts** - Data visualization
- **Axios** - HTTP client
- **React Toastify** - Notifications
- **Socket.io-client** - Real-time features
- **Framer Motion** - Animations
- **Material-UI** - Component library (Admin)

### Development Tools
- **PostCSS** - CSS processing
- **ESLint** - Code linting
- **Autoprefixer** - CSS vendor prefixes

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### ⚠️ Important Security Note
- **Never commit .env files** to version control
- **Use .env.example files** as templates for your environment setup
- **Keep API keys secure** and never share them publicly
- **Follow the setup instructions** carefully to avoid exposing sensitive data

### 1. Clone the Repository
```bash
git clone <repository-url>
cd MindMattersProject
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```bash
cp backend/.env.example backend/.env
```

Then edit `backend/.env` with your actual values:
```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
STRIPE_SECRET_KEY=your_stripe_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_SECRET=your_razorpay_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SENDGRID_API_KEY=your_sendgrid_key
EMAIL_FROM=your_email@domain.com
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:
```bash
cp frontend/.env.example frontend/.env
```

Then edit `frontend/.env` with your actual values:
```env
VITE_API_URL=http://localhost:4000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_OPENAI_API_KEY=your_openai_api_key
```

### 4. Admin Dashboard Setup
```bash
cd admin
npm install
```

### 5. MindConnect Chat Setup
```bash
cd MindConnect
npm install
cd backend && npm install
cd ../frontend && npm install
```

## 🏃‍♂️ Running the Application

### Development Mode

1. **Start Backend Server**
```bash
cd backend
npm run server
```

2. **Start Main Frontend**
```bash
cd frontend
npm run dev
```

3. **Start Admin Dashboard**
```bash
cd admin
npm run dev
```

4. **Start Chat Application**
```bash
cd MindConnect
npm start
```

### Production Build
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build

# Admin
cd admin
npm run build

# MindConnect
cd MindConnect
npm run build
```

## 📱 Features

### For Patients/Users
- User registration and authentication
- Browse and book appointments with mental health professionals
- Purchase mental health products and self-care items
- Real-time chat with therapists
- Appointment management and rescheduling
- Payment processing and order tracking
- **Order Management**: View order history, track delivery status, cancel orders
- **Real-time Notifications**: Get instant updates on order status changes, delivery updates
- Support ticket system
- Mental health chatbot assistance

### For Therapists/Doctors
- Professional profile management
- Appointment scheduling and management
- Client notes and progress tracking
- Goal setting and milestone tracking
- Session documentation
- Payment tracking and earnings analytics

### For Students
- University-specific mental health services
- Student request management
- Academic stress support
- Peer support features

### For Administrators
- User management across all roles
- Analytics and reporting dashboards
- Product and inventory management
- Payment and order oversight
- **Order Management**: Process orders, assign delivery partners, update order status
- **Delivery Partner Management**: Manage delivery partners, assign orders, track deliveries
- **Notification Management**: System-wide notification control and monitoring
- System configuration and maintenance

### For Supply Managers
- Product catalog management
- Inventory tracking
- Order fulfillment
- **Order Processing**: View and process incoming orders
- **Delivery Coordination**: Coordinate with delivery partners
- Supplier relationship management

## 🔐 Authentication & Authorization

The platform implements role-based access control with JWT tokens:

- **Patients**: Access to booking, shopping, and personal data
- **Therapists**: Access to client management and appointment tools
- **Doctors**: Medical professional features
- **Students**: University-specific features
- **Admins**: Full system access
- **Supply Managers**: Product and inventory management


## 📊 Analytics & Reporting

- Appointment analytics and trends
- Revenue and payment tracking
- User engagement metrics
- Product sales analytics
- **Order Analytics**: Order volume trends, delivery performance, cancellation rates
- **Delivery Partner Analytics**: Performance metrics, delivery success rates, partner efficiency
- Performance dashboards for all user roles

## 🔄 Real-time Features

- Live chat between patients and therapists
- Real-time appointment notifications
- Live order status updates
- Instant payment confirmations
- **Notification System**: Instant alerts for order changes, delivery updates, and system events

## 🛡️ Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Secure file uploads
- HTTPS enforcement
- Environment variable protection
- **Git Security**: .env files are excluded from version control
- **API Key Protection**: Sensitive keys are stored in environment variables only
- **Secure Development**: Template files (.env.example) provided for safe setup

## 📁 Project Structure

```
MindMattersProject/
├── backend/
│   ├── config/          # Database and service configurations
│   ├── controllers/     # Business logic handlers
│   ├── middleware/      # Authentication and validation
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   └── utils/           # Helper functions
├── frontend/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page components
│   ├── context/         # React context providers
│   ├── services/        # API service functions
│   └── assets/          # Static assets
├── admin/
│   ├── components/      # Admin-specific components
│   ├── pages/           # Admin dashboard pages
│   └── context/         # Admin state management
└── MindConnect/
    ├── backend/         # Chat server
    └── frontend/        # Chat interface
```


---

## 👥 Team Information

**Academic Group Project - Y2S2 ITP Module**

This project was developed as a collaborative effort by our team to demonstrate:
- Full-stack development skills using MERN stack
- Real-world application development
- Database design and management
- API development and integration
- User interface design and user experience
- Project management and collaboration
- Modern web development practices
- **Security best practices** - Environment variable management and API key protection
- **Version control best practices** - Proper .gitignore and sensitive data handling

**Built with ❤️ for better mental health care**