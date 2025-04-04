import mongoose from "mongoose"

const deliveryPartnerSchema = new mongoose.Schema({
  deliveryPartnerId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  contact: { type: String, required: true },
  vehicleDetails: { type: String },
  assignedOrders: [
    {
      orderId: { type: String, required: true },
      status: {
        type: String,
        enum: ["Out for Delivery", "Completed"],
        default: "Out for Delivery"
      },
      estimatedDeliveryTime: { type: Date }
    }
  ],
  createdAt: { type: Date, default: Date.now }
})

const deliveryPartnerModel =
  mongoose.models.deliveryPartner || mongoose.model("deliveryPartner", deliveryPartnerSchema)

export default deliveryPartnerModel


