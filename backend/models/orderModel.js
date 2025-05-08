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
  deliveryStatus: {
    type: String,
    enum: ["UnAssigned", "Assigned", "Delivered"],
    default: "UnAssigned"
  },
  cancelReason: { type: String },
  products: { type: Number, required: true },
  shippingCost: { type: Number, required: true, default: 500 },
  totalAmount: { type: Number, required: true },
  deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPartner' },
  estimatedDelivery: { type: Date },
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
      price: Number,
      color: String,
      size: String,
      image: String,
    },
  ],
  // New payment fields
  paymentStatus: {
    type: String,
    enum: ["Pending", "Completed", "Failed"],
    default: "Pending",
  },
  paymentMethod: {
    type: String,
    enum: ["Card", "Cash"],
    default: "Card",
  },
  paymentDate: { type: Date },
  paymentDetails: {
    cardLast4: String,
    cardType: String,
  },
});

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;
