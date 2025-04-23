import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
    default: "Pending"
  },
  products: { type: Number, required: true },
  shippingCost: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  shippingInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    apartment: String,
    city: String,
    postalCode: String,
    district: String,
    country: { type: String, default: "Sri Lanka" }
  },
  items: [
    {
      name: String,
      quantity: Number,
      price: Number
    }
  ]
})

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema)
export default orderModel;




