const express = require("express");
const router = express.Router();
const paymentController = require("../controller/paymentController");
const verifyRole = require("../middleware/authMiddleware"); // Assuming you have auth middleware

router.post("/create-order", verifyRole("user"), paymentController.createRazorpayOrder);
router.post("/verify", verifyRole("user"), paymentController.verifyPayment);
router.get('/:bookingId/:pg',  paymentController.getPaymentDetails);
router.get("/has-completed-payment/:pg", paymentController.hasCompletedPayment);

module.exports = router;
