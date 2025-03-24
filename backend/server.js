import express from "express"
import cors from 'cors'
import 'dotenv/config'
import connectDB from "./config/mongodb.js"
import connectCloudinary from "./config/cloudinary.js"
import userRouter from "./routes/userRoute.js"
import doctorRouter from "./routes/doctorRoute.js"
import adminRouter from "./routes/adminRoute.js"
import productRoutes from './routes/productRoutes.js'
import feedbackRoutes from './routes/feedbackRoutes.js'
import supportTicketRoutes from './routes/supportTicketRoutes.js'
import smRouter from "./routes/supplyManager.js"

// app config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

// middlewares
app.use(express.json())
app.use(cors())

// api endpoints
app.use('/uploads', express.static('uploads'))
app.use('/api/products', productRoutes)
app.use('/api/feedbacks', feedbackRoutes)
app.use('/api/supportTickets', supportTicketRoutes)
app.use("/api/user", userRouter)
app.use("/api/admin", adminRouter)
app.use("/api/doctor", doctorRouter)
app.use("/api/supplymanager", smRouter)

app.get("/", (req, res) => {
  res.send("API Working")
});

app.listen(port, () => console.log(`Server started on PORT:${port}`))