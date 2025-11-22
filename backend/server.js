require('dotenv').config();
const express=require("express")
require("dotenv").config()
const mongoose=require("mongoose")
const cors=require("cors")
const complaintRoutes=require("./routes/complaintRoutes")
const userRoutes=require("./routes/userRoutes")
const adminRoutes=require("./routes/adminRoutes")
const pgRoutes=require("./routes/pgDetailsRoute") 
const bookingRoutes=require("./routes/bookingRoutes")
const cookieParser = require('cookie-parser');
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();
//added the comment
app.use(cookieParser());

// ✅ Always parse JSON before routes
const allowedOrigins = [
  'https://rent-spotter.vercel.app',
  'https://rent-spotter-utzl.vercel.app', // optional if you no longer use it
  'http://localhost:3000' // for local dev
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy does not allow this origin'));
    }
  },
  credentials: true
}));
app.use(express.json()); 
app.use("/",complaintRoutes)
app.use("/",userRoutes)
app.use("/",adminRoutes)
app.use("/",pgRoutes)
app.use("/",bookingRoutes)
app.use("/api/payment", paymentRoutes);

app.get("/",(req,res)=>{
    res.send("hello");
})
app.listen(8000,()=>{
    console.log("backend connected")
})
