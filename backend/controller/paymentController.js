// const Razorpay = require('razorpay');
// const crypto = require('crypto');
// const Payment = require('../model/payment');
// const Booking = require('../model/booking');
// const PGDetail = require('../model/pgDetails');
// const mongoose = require('mongoose');

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// exports.createRazorpayOrder = async (req, res) => {
//   try {
//     const { bookingId } = req.body;
//     if (!mongoose.Types.ObjectId.isValid(bookingId)) {
//       return res.status(400).json({ message: 'Invalid booking ID' });
//     }

//     const userId = req.user.id;

//     const booking = await Booking.findById(bookingId).populate('pg');
//     if (!booking) {
//       return res.status(404).json({ message: 'Booking not found' });
//     }
//     if (booking.user.toString() !== userId) {
//       return res.status(403).json({ message: 'Unauthorized' });
//     }
//     if (booking.status !== 'confirmed') {
//       return res.status(400).json({ message: 'Booking must be confirmed to proceed with payment' });
//     }

//     const pg = await PGDetail.findById(booking.pg);
//     if (!pg) {
//       return res.status(404).json({ message: 'PG not found' });
//     }

//     const totalAmount = (pg.rent + (pg.charges.deposit || 0));

//     const order = await razorpay.orders.create({
//       amount: totalAmount,
//       currency: 'INR',
//       receipt: `receipt_${bookingId}`,
//       notes: { bookingId, userId },
//     });

//     const payment = await Payment.create({
//       user: userId,
//       booking: bookingId,
//       pg: booking.pg,
//       totalAmount: totalAmount,
//       transactionId: order.id,
//       razorpayOrderId: order.id,
//       razorpayPaymentId: '',
//       paymentStatus: 'pending',
//     });

//     res.status(200).json({
//       message: 'Order created successfully',
//       orderId: order.id,
//       amount: totalAmount,
//       key: process.env.RAZORPAY_KEY_ID,
//       paymentId: payment._id,
//     });
//   } catch (error) {
//     console.error('Error creating Razorpay order:', error);
//     res.status(500).json({ message: 'Error creating order', error: error.message });
//   }
// };

// exports.verifyPayment = async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

//     const body = razorpay_order_id + '|' + razorpay_payment_id;
//     const expectedSignature = crypto
//       .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
//       .update(body.toString())
//       .digest('hex');

//     if (expectedSignature !== razorpay_signature) {
//       return res.status(400).json({ message: 'Invalid payment signature' });
//     }

//     const payment = await Payment.findById(paymentId);
//     if (!payment) {
//       return res.status(404).json({ message: 'Payment not found' });
//     }

//     payment.razorpayPaymentId = razorpay_payment_id;
//     payment.paymentStatus = 'completed';
//     payment.paymentDate = new Date();
//     await payment.save();

//     await Booking.findByIdAndUpdate(payment.booking, {
//       payment: payment._id,
//       status: 'completed',
//     });

//     res.status(200).json({ message: 'Payment verified successfully' });
//   } catch (error) {
//     console.error('Error verifying payment:', error);
//     res.status(500).json({ message: 'Error verifying payment', error: error.message });
//   }
// };
// controllers/paymentController.js
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../model/payment");
const Booking = require("../model/booking");
const PGDetail = require("../model/pgDetails");
const mongoose = require("mongoose");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const userId = req.user.id;

    // const existingCompletedBooking = await Booking.findOne({

    //       status: "completed",
    //     });
    //     console.log(existingCompletedBooking)
    //     if (existingCompletedBooking) {
    //       return res.status(400).json({
    //         message: "You already have a completed booking. Cannot create a new booking.",
    //         rejectionReason: "User has an active completed booking.",
    //       });
    //     }

    const booking = await Booking.findById(bookingId).populate("pg");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.user.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (booking.status !== "confirmed") {
      return res.status(400).json({
        message: "Booking must be confirmed to proceed with payment",
      });
    }

    const pg = await PGDetail.findById(booking.pg);
    if (!pg) {
      return res.status(404).json({ message: "PG not found" });
    }

    const totalAmount = pg.rent + (pg.charges.deposit || 0);

    const order = await razorpay.orders.create({
      amount: totalAmount * 100, // Convert to paise
      currency: "INR",
      receipt: `receipt_${bookingId}`,
      notes: { bookingId, userId },
    });

    const payment = await Payment.create({
      user: userId,
      booking: bookingId,
      pg: booking.pg,
      totalAmount: totalAmount * 100, // Store in paise
      transactionId: order.id,
      razorpayOrderId: order.id,
      razorpayPaymentId: "",
      paymentStatus: "pending",
    });

    res.status(200).json({
      message: "Order created successfully",
      orderId: order.id,
      amount: totalAmount * 100, // Return in paise
      key: process.env.RAZORPAY_KEY_ID,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ message: "Error creating order", error: error.message });
  }
};

// ... rest of the paymentController.js remains unchanged

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.paymentStatus = 'completed';
    payment.paymentDate = new Date();
    await payment.save();

    // Link payment to booking without changing status
    await Booking.findByIdAndUpdate(payment.booking, {
      payment: payment._id,
    });

    res.status(200).json({ message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Error verifying payment', error: error.message });
  }
};

exports.getPaymentDetails = async (req, res) => {
  try {
    const {bookingId,pg} = req.params;
    console.log(bookingId,pg,"hello")

    
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "Invalid booking ID format." });
    }
    if (!mongoose.Types.ObjectId.isValid(pg)) {
      return res.status(400).json({ message: "Invalid payment ID format." });
    }


    const payment = await Payment.findOne({pg:pg,
      booking: new mongoose.Types.ObjectId(bookingId),
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json({ payment });
  } catch (err) {
    console.error("Error fetching payment details", err);
    res.status(500).json({ message: "Error fetching payment", error: err.message });
  }
};

// controllers/paymentController.js
exports.hasCompletedPayment = async (req, res) => {
  try {
    const userId = req.params.userId; // Or req.user.id if using auth middleware
    const completedPayment = await Payment.findOne({
      user: userId,
      paymentStatus: "completed",
    });

    res.status(200).json({
      hasCompletedPayment: !!completedPayment,
    });
  } catch (err) {
    console.error("Error checking completed payments:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};