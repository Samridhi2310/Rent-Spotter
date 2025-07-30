// controllers/bookingController.js
const Booking = require("../model/booking.js");
const PGDetail = require("../model/pgDetails.js");
const User = require("../model/user.js");
const Payment = require("../model/payment.js"); // Add Payment model

exports.createBooking = async (req, res) => {
  try {
    const { pg } = req.body;
    const user = req.user.id;

    console.log("PG ID from req.body:", pg);
    console.log("User ID from req.body:", user);

    if (!pg) {
      return res.status(400).json({ message: "PG ID is required" });
    }
    if (!user) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const pgExists = await PGDetail.findById(pg);
    const userExist = await User.findById(user);
    if (!pgExists) {
      return res.status(404).json({ message: "PG not found" });
    }
    if (!userExist) {
      return res.status(404).json({ message: "User not found" });
    }
    // // Check for existing completed booking
    // const existingCompletedBooking = await Booking.findOne({
    //   user,
    //   status: "completed",
    // });
    // const existingConfirmedBooking = await Booking.findOne({
    //   user,
    //   status: "confirmed",
    // });
    // console.log(existingCompletedBooking)
    // if (existingCompletedBooking || existingConfirmedBooking) {
    //   return res.status(400).json({
    //     message: "You already have a completed booking. Cannot create a new booking.",
    //     rejectionReason: "User has an active completed booking.",
    //   });
    // }
    const booking = new Booking({
      pg,
      user,
      status: "pending",
    });

    const savedBooking = await booking.save();
    return res.status(201).json({
      message: "Booking created successfully",
      bookingId: savedBooking._id,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Error creating booking", error: error.message });
  }
};
// Fetch booking status by user and PG
exports.FetchBookingDetails = async (req, res) => {
  try {
    const { user, pg } = req.params;
    console.log(user, pg);
    const booking = await Booking.findOne({ user, pg });
    console.log(booking)

    if (booking) {
      // Send both status and rejectionReason if the booking is rejected
      res.status(200).json({ 
        bookingId:booking._id,
        status: booking.status, 
        rejectionReason: booking.status === 'rejected' ? booking.rejectionReason : null 
      });
    } else {
      res.status(404).json({ message: 'No booking found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching booking status' });
  }
}

// Show all bookings for the current user
// Show all bookings for the current user
exports.ShowAllBooking = async (req, res) => {
  const user = req.params.user; // Correctly extract user ID from params
  

  try {
    // Step 1: Get all PGs added by this admin
    const adminPGs = await PGDetail.find({ adminId: user });

    if (adminPGs.length === 0) {
      return res.status(404).json({ message: "No PGs found for this admin" });
    }

    // Step 2: Extract PG IDs
    const pgIds = adminPGs.map(pg => pg._id);

    // Step 3: Get all bookings for these PGs
    const bookings = await Booking.find({ pg: { $in: pgIds } })
      .populate("user", "username email")
      .populate("pg", "name address.city");

    res.json({ bookings });
  } catch (err) {
    console.error("Error fetching bookings for admin:", err);
    res.status(500).json({ error: "Server error" });
  }

};

// Update booking status
exports.UpdateStatus = async (req, res) => {
  const { bookingId } = req.params;
  const { status, rejectionReason } = req.body;

  if (status === 'rejected' && !rejectionReason) {
    return res.status(400).json({ message: 'Rejection reason is required.' });
  }

  try {
    const updateFields = { status };

    if (status === 'rejected') {
      updateFields.rejectionReason = rejectionReason;
    } else {
      updateFields.rejectionReason = ''; // Clear any previous reason if confirming
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    return res.status(200).json({
      message: 'Booking status updated successfully',
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return res.status(500).json({ message: 'Error updating booking', error });
  }
};
// Show all bookings for the logged-in user
exports.ShowUserBookings = async (req, res) => { 
  const user = req.user.id;

  try {
    const userExist = await User.findById(user);
    if (!userExist) { 
      return res.status(404).json({ message: 'User not found' });
    }

    const bookings = await Booking.find({ user })  // Filter by logged-in user
      .populate("pg", "name address.city");

    res.status(200).json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
exports.CancelUserBooking = async (req, res) => {
  const userId = req.user.id;
  const { bookingId } = req.params;

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== userId) {
      return res.status(403).json({ message: 'You can only cancel your own bookings' });
    }

    // Prevent cancelling confirmed or completed bookings
    if (booking.status === 'confirmed' || booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel confirmed or completed bookings' });
    }

    booking.status = 'cancelled';
    await booking.save();

    return res.status(200).json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// controllers/bookingController.js

exports.requestVacate = async (req, res) => {
  const userId = req.user.id;
  const { bookingId } = req.params;
  const { vacateReason } = req.body;

  if (!vacateReason || vacateReason.trim() === "") {
    return res.status(400).json({ message: "Vacate reason is required." });
  }

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    if (booking.user.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized action." });
    }

    if (booking.status !== "completed") {
      return res.status(400).json({ message: "Only confirmed bookings can be vacated." });
    }

    booking.status = "pending_vacate";
    booking.vacateReason = vacateReason;
    booking.vacateRequestDate = new Date();

    await booking.save();

    return res.status(200).json({ message: "Vacate request submitted successfully." });
  } catch (error) {
    console.error("Error submitting vacate request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// controllers/bookingController.js

exports.respondVacateRequest = async (req, res) => {
  const ownerId = req.user.id;
  const { bookingId } = req.params;
  const { action, vacateDisputeReason } = req.body;

  if (!["approve", "reject"].includes(action)) {
    return res.status(400).json({ message: "Invalid action. Must be 'approve' or 'reject'." });
  }

  try {
    const booking = await Booking.findById(bookingId).populate("pg");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    if (booking.pg.adminId.toString() !== ownerId) {
      return res.status(403).json({ message: "Unauthorized action." });
    }

    if (booking.status !== "pending_vacate") {
      return res.status(400).json({ message: "No pending vacate request to respond to." });
    }

    if (action === "approve") {
      booking.status = "vacated";
      booking.vacateResponseDate = new Date();
      booking.vacateDisputeReason = "";
    } else {
      if (!vacateDisputeReason || vacateDisputeReason.trim() === "") {
        return res.status(400).json({ message: "Rejection reason is required." });
      }
      booking.status = "vacate_disputed";
      booking.vacateDisputeReason = vacateDisputeReason;
      booking.vacateResponseDate = new Date();
    }

    await booking.save();

    return res.status(200).json({ message: `Vacate request ${action}d successfully.` });
  } catch (error) {
    console.error("Error responding to vacate request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


