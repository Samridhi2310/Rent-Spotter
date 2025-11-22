// "use client";
// import React, { useEffect, useState } from "react";
// import axios from "axios";

// const UserBookings = () => {
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchBookings = async () => {
//       try {
//         const res = await axios.get("/api/proxy/my-bookings", {
//           withCredentials: true,
//         });
//         setBookings(res.data.bookings);
//       } catch (err) {
//         console.error(err);
//         setError("Failed to fetch bookings");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBookings();
//   }, []);

//   const handleCancel = async (bookingId) => {
//     const confirmCancel = window.confirm("Are you sure you want to cancel this booking?");
//     if (!confirmCancel) return;

//     try {
//       const res = await axios.put(
//         `/user/bookings/${bookingId}/cancel`,
//         {},
//         { withCredentials: true }
//       );

//       // Update bookings state
//       setBookings((prev) =>
//         prev.map((b) =>
//           b._id === bookingId ? { ...b, status: "cancelled" } : b
//         )
//       );

//       alert("Booking cancelled successfully.");
//     } catch (error) {
//       console.error("Cancel error:", error);
//       alert("Failed to cancel booking.");
//     }
//   };

//   if (loading) return <p className="text-gray-500">Loading bookings...</p>;
//   if (error) return <p className="text-red-500">{error}</p>;
//   if (bookings.length === 0) return <p>No bookings found.</p>;

//   return (
//     <div className="max-w-3xl mx-auto p-4">
//       <h2 className="text-2xl font-bold mb-4 text-teal-700">My Bookings</h2>
//       <ul className="space-y-4">
//         {bookings.map((booking) => (
//           <li
//             key={booking._id}
//             className="border rounded-lg p-4 shadow-sm bg-white"
//           >
//             <div className="flex justify-between items-center">
//               <div>
//                 <p className="font-semibold">PG Name: {booking.pg?.name}</p>
//                 <p>City: {booking.pg?.address?.city}</p>
//                 <p>
//                   Status:
//                   <span
//                     className={`ml-2 font-medium ${
//                       booking.status === "confirmed"
//                         ? "text-green-600"
//                         : booking.status === "rejected"
//                         ? "text-red-600"
//                         : booking.status === "cancelled"
//                         ? "text-gray-500"
//                         : "text-yellow-600"
//                     }`}
//                   >
//                     {booking.status}
//                   </span>
//                 </p>
//                 {booking.status === "rejected" &&
//                   booking.rejectionReason && (
//                     <p className="text-sm text-red-500">
//                       Reason: {booking.rejectionReason}
//                     </p>
//                   )}
//               </div>

//               {/* Cancel Button */}
//               {booking.status === "pending" && (
//                 <button
//                   onClick={() => handleCancel(booking._id)}
//                   className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
//                 >
//                   Cancel
//                 </button>
//               )}
//             </div>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default UserBookings;
"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {toast, Toaster } from "react-hot-toast";

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [vacateInputs, setVacateInputs] = useState({});

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get(`${NEXT_PUBLIC_BACKEND_URL}/api/proxy/my-bookings`, {
          withCredentials: true,
        });
        setBookings(res.data.bookings);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch bookings");
        toast.error("Failed to fetch bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this booking?");
    if (!confirmCancel) return;

    try {
      await axios.put(`${NEXT_PUBLIC_BACKEND_URL}/api/proxy/user/bookings/${bookingId}/cancel`,
        {},
        { withCredentials: true }
      );

      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, status: "cancelled" } : b
        )
      );

      toast.success("Booking cancelled successfully.");
    } catch (error) {
      console.error("Cancel error:", error);
      toast.error("Failed to cancel booking.");
    }
  };

  const handleVacateToggle = (bookingId) => {
    setVacateInputs((prev) => ({
      ...prev,
      [bookingId]: prev[bookingId] ? null : "",
    }));
  };

  const handleVacateReasonChange = (bookingId, value) => {
    setVacateInputs((prev) => ({
      ...prev,
      [bookingId]: value,
    }));
  };

  const handleVacateSubmit = async (bookingId) => {
    const reason = vacateInputs[bookingId];
    if (!reason.trim()) {
      toast.error("Please provide a reason for vacating.");
      return;
    }

    try {
      await axios.post(`${NEXT_PUBLIC_BACKEND_URL}/api/proxy/bookings/${bookingId}/vacate`,
        { vacateReason: reason },
        { withCredentials: true }
      );

      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, status: "pending_vacate" } : b
        )
      );

      setVacateInputs((prev) => ({
        ...prev,
        [bookingId]: null,
      }));

      toast.success("Vacate request submitted successfully.");
    } catch (error) {
      console.error("Vacate request error:", error);
      toast.error("Failed to submit vacate request.");
    }
  };

  if (loading) return <p className="text-gray-500">Loading bookings...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (bookings.length === 0) return <p>No bookings found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-teal-700">My Bookings</h2>
      <ul className="space-y-4">
        {bookings.map((booking) => (
          <li
            key={booking._id}
            className="border rounded-lg p-4 shadow-sm bg-white"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">PG Name: {booking.pg?.name}</p>
                <p>City: {booking.pg?.address?.city}</p>
                <p>
                  Status:
                  <span
                    className={`ml-2 font-medium ${
                      booking.status === "confirmed"
                        ? "text-green-600"
                        : booking.status === "rejected"
                        ? "text-red-600"
                        : booking.status === "cancelled"
                        ? "text-gray-500"
                        : booking.status === "pending_vacate"
                        ? "text-yellow-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {booking.status}
                  </span>
                </p>
                {booking.status === "rejected" &&
                  booking.rejectionReason && (
                    <p className="text-sm text-red-500">
                      Reason: {booking.rejectionReason}
                    </p>
                  )}
              </div>

              <div className="flex flex-col items-end">
                {booking.status === "pending" && (
                  <button
                    onClick={() => handleCancel(booking._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md mb-2"
                  >
                    Cancel
                  </button>
                )}
                {booking.status === "completed" && (
                  <>
                    <button
                      onClick={() => handleVacateToggle(booking._id)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md"
                    >
                      {vacateInputs[booking._id] !== undefined
                        ? "Hide Reason"
                        : "Request Vacate"}
                    </button>
                    {vacateInputs[booking._id] !== undefined && (
                      <div className="mt-2 w-full">
                        <textarea
                          rows={3}
                          className="w-full border rounded-md p-2"
                          placeholder="Enter reason for vacating..."
                          value={vacateInputs[booking._id]}
                          onChange={(e) =>
                            handleVacateReasonChange(
                              booking._id,
                              e.target.value
                            )
                          }
                        />
                        <button
                          onClick={() => handleVacateSubmit(booking._id)}
                          className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                        >
                          Submit Vacate Request
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
      

    </div>

  );
};

export default UserBookings;
