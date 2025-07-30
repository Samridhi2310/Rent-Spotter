// const mongoose=require("../config/db")
// const schema=mongoose.Schema({
//     Name:{required:true,type:String},
//     Email: { required: true, type: String },
//     PhoneNumber:{required:true,type:Number},
//     EnquiryType:{required:true,type:String},
//     Message:{required:true,type:String},
//     user: {
//         type: mongoose.Schema.Types.ObjectId, 
//         ref: 'userDetail',
//         required: true,
//       },
// })
// const EnquiryDetails=mongoose.model("Enquiry Detail",schema)
// module.exports=EnquiryDetails;
const mongoose = require("../config/db");

const schema = mongoose.Schema({
  Name: { required: true, type: String },
  Email: { required: true, type: String },
  PhoneNumber: { required: true, type: Number },
  EnquiryType: { required: true, type: String },
  Message: { required: true, type: String },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userDetail",
    required: true,
  },
  status: {
    type: String,
    enum: ["Open", "In Progress", "Resolved", "Archived"],
    default: "Open",
  },
  replies: [
    {
      adminId: { type: mongoose.Schema.Types.ObjectId, ref: "userDetail" },
      message: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  isArchived: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update `updatedAt` on save
schema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const EnquiryDetails = mongoose.model("EnquiryDetail", schema);
module.exports = EnquiryDetails;