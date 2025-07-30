const express = require('express');
const router = express.Router();

const verifyRole = require('../middleware/authMiddleware');
const { createBooking,FetchBookingDetails,ShowAllBooking,UpdateStatus,ShowUserBookings,CancelUserBooking,requestVacate,respondVacateRequest } = require('../controller/bookingController');

// Now isAuthenticated is correctly imported
router.post('/booking', verifyRole("user"), createBooking);
// bookingRoutes.js
router.get('/booking-status/:user/:pg', FetchBookingDetails)
router.get("/showAllBooking/:user",ShowAllBooking)
router.put("/update/:bookingId",verifyRole("admin"),UpdateStatus)
router.get('/my-bookings', verifyRole("user"), ShowUserBookings);
router.put('/user/bookings/:bookingId/cancel', verifyRole("user"), CancelUserBooking);
router.post('/bookings/:bookingId/vacate', verifyRole("user"), requestVacate);

// Owner responds to vacate request
router.post('/bookings/:bookingId/vacate-response', verifyRole("admin"), respondVacateRequest);



module.exports = router;
;