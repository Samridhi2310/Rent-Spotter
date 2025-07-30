const mongoose = require("../config/db");

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userDetail',
    required: true,
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  pg: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PGDetail',
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay'],
    default: 'razorpay',
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  razorpayPaymentId: {
    type: String,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  paymentReceipt: {
    type: String,
  },
}, { timestamps: true });

console.log("Payment model being loaded...");
module.exports = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

 