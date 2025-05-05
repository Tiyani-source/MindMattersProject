import express from "express"
import cors from 'cors'
import 'dotenv/config'
import connectDB from "./config/mongodb.js"
import connectCloudinary from "./config/cloudinary.js"
import userRouter from "./routes/userRoute.js"
import doctorRouter from "./routes/doctorRoute.js"
import adminRouter from "./routes/adminRoute.js"
import dRequestRouter from "./routes/dRequestRoute.js"
import universityRouter from "./routes/universityRoute.js"
import studRequestRouter from "./routes/studReqRoute.js"
import studentRouter from "./routes/studentRoute.js"
import patientRouter from "./routes/patientRoute.js"

import paymentRoutes from "./routes/paymentRoutes.js";


import orderRouter from "./routes/orderRoute.js"
import wishlistRouter from "./routes/wishlistRoutes.js"
import shoppingCartRouter from "./routes/shoppingCartRoute.js"

import productRoutes from './routes/productRoutes.js'
import feedbackRoutes from './routes/feedbackRoutes.js'
import supportTicketRoutes from './routes/supportTicketRoutes.js'
import smRouter from "./routes/supplyManager.js"

import userOverviewRouter from "./routes/userOverview.route.js"

// app config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

// middlewares
app.use(express.json())
app.use(cors())

// api endpoints
app.use("/api/user", userRouter)
app.use("/api/admin", adminRouter)
app.use("/api/doctor", doctorRouter)
app.use("/api/doctor-request", dRequestRouter)
app.use("/api/university", universityRouter)
app.use("/api/student-request", studRequestRouter)
app.use("/api/student", studentRouter)
app.use("/api/patients", patientRouter);

app.use('/uploads', express.static('uploads'))
app.use('/api/products', productRoutes)
app.use('/api/feedbacks', feedbackRoutes)
app.use('/api/supportTickets', supportTicketRoutes)

app.use("/api/user", userRouter)
app.use("/api/admin", adminRouter)
app.use("/api/doctor", doctorRouter)
app.use("/api/payments", paymentRoutes)
app.use("/api/orders", orderRouter)
app.use("/api/wishlist", wishlistRouter)
app.use("/api/cart", shoppingCartRouter)
app.use("/api/supplymanager", smRouter)

app.use("/api/user-overview", userOverviewRouter)

// test route
app.get("/", (req, res) => {
  res.send("API Working")
});

app.listen(port, () => console.log(`Server started on PORT:${port}`))