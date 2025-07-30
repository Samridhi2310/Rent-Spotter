// models/Booking.js
// const mongoose=require("../config/db")

// const bookingSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'userDetail',
//     required: true,
//   },
//   pg: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'PGDetail',
//     required: true,
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'confirmed', 'rejected',"cancelled","pending_vacate","vacated"],
//     default: 'pending',
//   },
//   bookingDate: {
//     type: Date,
//     default: Date.now,
//   },
//   rejectionReason: {
//     type: String,
//     default: '',
//   },
// });

// module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
const mongoose = require("../config/db");

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userDetail",
    required: true,
  },
  pg: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PGDetail",
    required: true,
  },
  status: {
    type: String,
    enum: [
      "pending",
      "confirmed",
      "rejected",
      "cancelled",
      "pending_vacate",
      "vacate_disputed",
      "vacated",
    ],
    default: "pending",
  },
  bookingDate: {
    type: Date,
    default: Date.now,
  },
  rejectionReason: {
    type: String,
    default: "",
  },
  vacateReason: {
    type: String,
    default: "",
  },
  vacateDisputeReason: {
    type: String,
    default: "",
  },
  vacateRequestDate: {
    type: Date,
  },
  vacateResponseDate: {
    type: Date,
  },
});

module.exports = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);