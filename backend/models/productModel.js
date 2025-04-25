import mongoose from 'mongoose';

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true
  },
  courier: {
    type: String,
    required: true
  },
  colour: {
    type: String,
    required: true
  },
  size: {
    type: String,
    required: true
  },
  desc: {
    type: String,
    required: true
  },
  feedback: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);

export default Product;