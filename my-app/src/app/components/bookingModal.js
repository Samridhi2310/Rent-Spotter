import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import PaymentButton from "../dashboard/payment/page";
import { useSession } from "next-auth/react";

function BookingModal({ isOpen, onClose, pgDetails, bookingStatus, hasCompletedPayment }) {
  const router = useRouter();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();

  const fetchPaymentDetails = async () => {
    if (!bookingStatus?.bookingId || !pgDetails?._id) {
      console.error("Missing bookingId or pgId:", { bookingId: bookingStatus?.bookingId, pgId: pgDetails?._id });
      setError("Booking ID or PG ID is missing.");
      return;
    }

    console.log("Fetching payment details for:", {
      bookingId: bookingStatus.bookingId,
      pgId: pgDetails._id,
      pgName: pgDetails.name,
    });

    setLoading(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/${bookingStatus.bookingId}/${pgDetails._id}?t=${Date.now()}`,
        {
          withCredentials: true,
          headers: {
    "Authorization": `Bearer ${session.accessToken}`,  // ← this works
    "Content-Type": "application/json",
             "Cache-Control": "no-cache"
  },
        }
      );

      console.log("Payment API response:", response.data);

      setPaymentDetails(response.data.payment || response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching payment details:", err);
      setError("Failed to fetch payment details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && bookingStatus && pgDetails && status === "authenticated") {
      setPaymentDetails(null);
      setError(null);
      setLoading(false);
      fetchPaymentDetails();
    }
  }, [isOpen, bookingStatus?.bookingId, pgDetails?._id, status]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
        <h3 className="text-xl font-semibold mb-4 text-center font-serif">Booking Status</h3>

        <p className="mb-2 font-serif">
          <strong>PG Name:</strong> {pgDetails?.name || "Unknown PG"}
        </p>

        <p className="mb-2 font-serif">
          <strong>Booking Status:</strong> {bookingStatus?.status || "No status available"}
        </p>

        {bookingStatus?.status === "rejected" && (
          <p className="text-red-500 font-serif">
            <strong>Rejection Reason:</strong>{" "}
            {bookingStatus?.rejectionReason || "No reason provided"}
          </p>
        )}

        {bookingStatus?.status === "pending" && (
          <p className="text-yellow-600 font-semibold font-serif">
            Your booking is currently pending. Please wait while the admin reviews it.
          </p>
        )}

        {bookingStatus?.status === "confirmed" && (
          <>
            <p className="mb-2 font-serif">
              <strong>Payment Status:</strong>{" "}
              {paymentDetails?.paymentStatus || "Pending"}
            </p>

            {paymentDetails && 
             (paymentDetails.paymentStatus?.toLowerCase() === "completed" || 
              paymentDetails.paymentStatus?.toLowerCase() === "failed") ? (
              <div className="mb-2 font-serif">
                <p>
                  <strong>Total Amount:</strong> ₹{(paymentDetails.totalAmount / 100) || "N/A"}
                </p>
                <p>
                  <strong>Payment Date:</strong>{" "}
                  {paymentDetails.paymentDate
                    ? new Date(paymentDetails.paymentDate).toLocaleDateString()
                    : "N/A"}
                </p>
                <p>
                  <strong>Razorpay Payment ID:</strong>{" "}
                  {paymentDetails.razorpayPaymentId || "N/A"}
                </p>
              </div>
            ) : (
              <p className="text-gray-600 font-serif">No payment details available.</p>
            )}

            {loading && <p className="text-gray-600 font-serif">Loading payment details...</p>}
            {error && <p className="text-red-500 font-serif">{error}</p>}

            <p className="mb-4 text-green-600 font-extrabold font-serif">
              Your booking has been confirmed!
            </p>

            {paymentDetails?.paymentStatus?.toLowerCase() === "completed" ? (
              <p className="text-blue-600 font-semibold font-serif">
                Payment completed. Your booking is awaiting final approval from the owner.
              </p>
            ) : (
              <div className="text-start">
                <p className="mb-2 font-bold font-serif">Proceed with payment:</p>
                <PaymentButton
                  bookingId={bookingStatus.bookingId}
                  bookingStatus={bookingStatus}
                  onPaymentComplete={(success) => {
                    if (success) {
                      setPaymentDetails(null);
                      fetchPaymentDetails();
                    }
                  }}
                />
              </div>
            )}
          </>
        )}

        {bookingStatus?.status === "completed" && (
          <p className="text-green-600 font-semibold font-serif">
            Your booking has been fully completed by the owner.
          </p>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingModal;


