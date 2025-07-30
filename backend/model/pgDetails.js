const mongoose = require("../config/db");

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city:   { type: String, required: true },
  state:  { type: String, required: true },
  pincode:{ type: String, required: true },
  landmark: String,
}, { _id: false });

const pgDetailSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  genderAllowed: {
    type: String,
    enum: ['Boys', 'Girls'],
    required: true,
  },
  address: addressSchema,
  rent: {
    type: Number,
    required: true,
  },
  amenities: {
    type: [String],
    default: [],
  },
  charges: {
    electricity: { type: Number, default: 0 },
    maintenance: { type: Number, default: 0 },
    deposit:     { type: Number, default: 0 },
  },
  sharing: {
    type: String,
    enum: ['Single', 'Double', 'Triple', 'Quad', 'Bunk Bed'],
    required: true,
  },
  rules: {
    type: [String],
    default: [],
  },
  availability: {
    type: Boolean,
    default: true,
  },
  images: {
    type: [String],
    default: [],
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userDetail',
    required: true,
  },
}, { timestamps: true });

const pgDetailModel = mongoose.model("PGDetail", pgDetailSchema);

module.exports = pgDetailModel;;
