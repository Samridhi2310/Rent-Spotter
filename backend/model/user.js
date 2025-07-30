// const mongoose = require("../config/db");
// const userSchema = mongoose.Schema({
//   username: {
//     type: String,
//     required: true,
//     trim: true,
//     minlength: 3,
//     maxlength: 30,
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true,
//     trim: true,
//   },
//   password: {
//     type: String,
//     required: true,
//   },
//   gender: {
//     type: String,
//     enum: ["male", "female", "unknown"],
//     default: "unknown",
//   },
//   phone: {
//     type: String,
//     default: "unknown",
//   },
//   role: {
//     type: String,
//     enum: ["user", "admin"],
//     default: "user",
//   },
//   provider: {
//     type: String,
//     enum: ["credentials", "github", "google"],
//     default: "credentials",
//   },
//   bookings: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Booking",
//     },
//   ],
//   complaints: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Complaint",
//     },
//   ],
//   isActive: {
//     type: Boolean,
//     default: true,
//   },
// }, { timestamps: true });

// const userModel = mongoose.model("userDetail", userSchema);
// module.exports = userModel;
const mongoose = require("../config/db");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ["male", "female", "unknown"],
    default: "unknown",
  },
  phone: {
    type: Number,
    default: "unknown",
  },
  role: {
    type: String,
    enum: ["user", "admin", "pending_admin","superadmin"],
    default: "user",
  },
  provider: {
    type: String,
    enum: ["credentials", "github", "google"],
    default: "credentials",
  },
  bookings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
  ],
  complaints: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  rejectionReason: { type: String, default: null }, // New field
  pgDetails: {
    propertyAddress: { type: String },
    registrationNumber: { type: String },
    noc: { type: String },
    tradeLicense: { type: String },
    policeVerification: { type: String },
    gstRegistration: { type: String },
    propertyInsurance: { type: String },
    healthSanitationCertificate: { type: String },
  },
  applicationStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
}, { timestamps: true });

const userModel = mongoose.model("userDetail", userSchema);
module.exports = userModel;
