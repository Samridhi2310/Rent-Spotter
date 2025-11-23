"use client";
import React, { useEffect, useState } from "react";
import AdminLayout from "@/app/adminDashboardLayout";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";
import toast, { Toaster } from "react-hot-toast";

const AdminBookingDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [rejectionReason, setRejectionReason] = useState("");
  const [vacateDisputeReason, setVacateDisputeReason] = useState("");
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [editingVacateBookingId, setEditingVacateBookingId] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({});
  const [error, setError] = useState("");
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      console.log("Fetching bookings for user ID:", session.user.id);
      fetchBookings();
    }
  }, [status, session]);

  const fetchBookings = async () => {
    try {
      setError("");
      console.log("Sending GET request to fetch bookings...");
      const response = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/proxy/showAllBooking/${session.user.id}`, {
        method: "GET",
        headers: {
              "Authorization": `Bearer ${session.accessToken}`,  // ← this works
              "Content-Type": "application/json"
             },
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Fetch bookings failed:", errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Bookings fetched:", data);
      setBookings(Array.isArray(data.bookings) ? data.bookings : []);

      const confirmedBookings = (Array.isArray(data.bookings) ? data.bookings : []).filter(
        (booking) => booking.status === "confirmed"
      );
      console.log("Confirmed bookings:", confirmedBookings);
      await fetchPaymentDetails(confirmedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError(error.message || "Failed to fetch bookings. Please try again.");
      setBookings([]);
    }
  };

  const fetchPaymentDetails = async (confirmedBookings) => {
    try {
      const paymentDetailsMap = {};
      const userId = session.user.id;
      console.log("Fetching payment details for", confirmedBookings.length, "confirmed bookings");

      for (const booking of confirmedBookings) {
        if (!booking?.pg?._id) {
          console.error(`PG ID not found for booking ${booking._id}`);
          continue;
        }
        console.log(`Fetching payment for booking ${booking._id}, PG ID: ${booking.pg._id}`);
        const response = await fetch(
          `/api/payment/${booking._id}/${booking.pg._id}`,
          {
            method: "GET",
            credentials: "include",
          headers: {
              "Authorization": `Bearer ${session.accessToken}`,  // ← this works
              "Content-Type": "application/json"
             },
          }
        );

        if (!response.ok) {
          console.error(`Failed to fetch payment for booking ${booking._id}: HTTP ${response.status}`);
          continue;
        }

        const paymentData = await response.json();
        console.log(`Payment data for booking ${booking._id}:`, paymentData);
        if (paymentData.payment) {
          paymentDetailsMap[booking._id] = paymentData.payment;
        }
      }

      console.log("Payment details map:", paymentDetailsMap);
      setPaymentDetails(paymentDetailsMap);
    } catch (error) {
      console.error("Error fetching payment details:", error);
    }
  };

  const handleRejectClick = (bookingId) => {
    console.log("Reject clicked for booking ID:", bookingId);
    setEditingBookingId(bookingId);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }

    try {
      console.log("Submitting rejection for booking ID:", editingBookingId);
      const response = await fetch(
        `/update/${editingBookingId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
              "Authorization": `Bearer ${session.accessToken}`,  // ← this works
              "Content-Type": "application/json"
             },
          body: JSON.stringify({
            status: "rejected",
            rejectionReason,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Reject submission failed:", errorData);
        throw new Error(errorData.message || "Failed to update status");
      }

      const result = await response.json();
      console.log("Rejection result:", result);
      toast.success(result.message || "Booking rejected successfully!");
      fetchBookings();
      setEditingBookingId(null);
      setRejectionReason("");
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error(`Error updating status: ${error.message}`);
    }
  };

  const handleConfirmClick = async (bookingId) => {
    try {
      console.log("Confirm clicked for booking ID:", bookingId);
      const response = await fetch(
        `/update/${bookingId}`,
        {
          method: "PUT",
          credentials: "include",
         headers: {
              "Authorization": `Bearer ${session.accessToken}`,  // ← this works
              "Content-Type": "application/json"
             },
          body: JSON.stringify({
            status: "confirmed",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Confirm failed:", errorData);
        throw new Error(errorData.message || "Failed to update status");
      }

      const result = await response.json();
      console.log("Confirm result:", result);
      toast.success(result.message || "Booking confirmed successfully!");
      fetchBookings();
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error(`Error updating status: ${error.message}`);
    }
  };

  const handleCompleteClick = async (bookingId) => {
    try {
      console.log("Complete clicked for booking ID:", bookingId);
      const response = await fetch(
        `/update/${bookingId}`,
        {
          method: "PUT",
          credentials: "include",
         headers: {
              "Authorization": `Bearer ${session.accessToken}`,  // ← this works
              "Content-Type": "application/json"
             },
          body: JSON.stringify({
            status: "completed",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Complete failed:", errorData);
        throw new Error(errorData.message || "Failed to update status");
      }

      const result = await response.json();
      console.log("Complete result:", result);
      toast.success(result.message || "Booking completed successfully!");
      fetchBookings();
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error(`Error updating status: ${error.message}`);
    }
  };

  const handleVacateActionClick = (bookingId) => {
    console.log("Vacate action clicked for booking ID:", bookingId);
    setEditingVacateBookingId(bookingId);
  };

  const handleVacateResponse = async (action) => {
    if (action === "reject" && !vacateDisputeReason.trim()) {
      toast.error("Please provide a dispute reason for rejecting the vacate request.");
      return;
    }

    try {
      console.log("Submitting vacate response:", action, "for booking ID:", editingVacateBookingId);
      const response = await fetch(
        `/bookings/${editingVacateBookingId}/vacate-response`,
        {
          method: "POST",
          credentials: "include",
         headers: {
              "Authorization": `Bearer ${session.accessToken}`,  // ← this works
              "Content-Type": "application/json"
             },
          body: JSON.stringify({
            action,
            vacateDisputeReason: action === "reject" ? vacateDisputeReason : "",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Vacate response failed:", errorData);
        throw new Error(errorData.message || "Failed to respond to vacate request");
      }

      const result = await response.json();
      console.log("Vacate response result:", result);
      toast.success(result.message || `Vacate request ${action}ed successfully!`);
      fetchBookings();
      setEditingVacateBookingId(null);
      setVacateDisputeReason("");
    } catch (error) {
      console.error("Error responding to vacate request:", error);
      toast.error(`Error responding to vacate request: ${error.message}`);
    }
  };

  const hideBackButton = pathname === "/" || pathname === "/dashboard";

  if (status === "loading") {
    return (
      <AdminLayout>
        <div className="p-4 sm:p-6 bg-white min-h-screen flex justify-center items-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (status === "unauthenticated") {
    return (
      <AdminLayout>
        <div className="p-4 sm:p-6 bg-white min-h-screen">
          <p className="text-center sm:text-left">Please log in to view bookings.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 bg-white min-h-screen">
        <Toaster
          position="top-right"
          toastOptions={{
            success: {
              style: {
                background: "#E6FFFA",
                color: "#2B6CB0",
                border: "1px solid #2B6CB0",
              },
            },
            error: {
              style: {
                background: "#FFF5F5",
                color: "#C53030",
                border: "1px solid #C53030",
              },
            },
          }}
        />
        <div className="flex items-center mb-4 sm:mb-6">
          {!hideBackButton && (
            <button
              onClick={() => router.back()}
              className="text-xl sm:text-2xl focus:outline-none text-gray-800 hover:text-teal-600 transition-colors duration-200 mr-2 sm:mr-4"
              aria-label="Go back"
            >
              <IoArrowBack />
            </button>
          )}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800 border-b-2 border-gray-300 pb-2">
            All Bookings
          </h2>
        </div>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        
        {/* Mobile view - Card layout */}
        <div className="md:hidden space-y-4">
          {bookings.length === 0 ? (
            <div className="bg-white p-4 rounded-xl shadow text-center text-gray-600">
              No bookings found.
            </div>
          ) : (
            bookings.map((booking) => {
              console.log(`Rendering booking ${booking._id}, status: ${booking.status}`);
              return (
                <div 
                  key={booking._id} 
                  className="bg-white p-4 rounded-xl shadow-md border border-gray-200"
                >
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">User</p>
                      <p className="font-medium">{booking.user?.username || "Unknown User"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">PG</p>
                      <p className="font-medium">{booking.pg?.name || "Unknown PG"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <p className="font-medium">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                          booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          booking.status === 'pending_vacate' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'vacated' ? 'bg-purple-100 text-purple-800' :
                          booking.status === 'vacate_disputed' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  {booking.status === "confirmed" && 
                   paymentDetails[booking._id] && 
                   (paymentDetails[booking._id].paymentStatus?.toLowerCase() === "completed" || 
                    paymentDetails[booking._id].paymentStatus?.toLowerCase() === "failed") && (
                    <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Payment Details</p>
                      <div className="text-xs space-y-1">
                        <p>Amount: ₹{paymentDetails[booking._id].totalAmount || "N/A"}</p>
                        <p>Status: {paymentDetails[booking._id].paymentStatus || "N/A"}</p>
                        <p>Date: {paymentDetails[booking._id].paymentDate ? new Date(paymentDetails[booking._id].paymentDate).toLocaleDateString() : "N/A"}</p>
                        <p className="truncate">ID: {paymentDetails[booking._id].razorpayOrderId || "N/A"}</p>
                      </div>
                    </div>
                  )}
                  
                  {(booking.status === "pending_vacate" || booking.status === "vacate_disputed" || booking.status === "vacated") && (
                    <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Vacate Details</p>
                      <div className="text-xs space-y-1">
                        {booking.vacateReason && <p>Reason: {booking.vacateReason}</p>}
                        {booking.vacateRequestDate && (
                          <p>Request Date: {new Date(booking.vacateRequestDate).toLocaleDateString()}</p>
                        )}
                        {booking.vacateDisputeReason && (
                          <p>Dispute Reason: {booking.vacateDisputeReason}</p>
                        )}
                        {booking.vacateResponseDate && (
                          <p>Response Date: {new Date(booking.vacateResponseDate).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      onClick={() => handleConfirmClick(booking._id)}
                      className="bg-[#17BEBB] text-white px-3 py-1 text-sm rounded-lg hover:bg-[#109795] transition duration-300 ease-in-out flex-1"
                      disabled={booking.status === "pending_vacate" || booking.status === "vacated"}
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleRejectClick(booking._id)}
                      className="bg-[#F56565] text-white px-3 py-1 text-sm rounded-lg hover:bg-[#C53030] transition duration-300 ease-in-out flex-1"
                      disabled={booking.status === "pending_vacate" || booking.status === "vacated"}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleCompleteClick(booking._id)}
                      className="bg-[#2ECC71] text-white px-3 py-1 text-sm rounded-lg hover:bg-[#27AE60] transition duration-300 ease-in-out flex-1"
                      disabled={booking.status === "pending_vacate" || booking.status === "vacated"}
                    >
                      Complete
                    </button>
                    {booking.status === "pending_vacate" && (
                      <button
                        onClick={() => handleVacateActionClick(booking._id)}
                        className="bg-[#FFA500] text-white px-3 py-1 text-sm rounded-lg hover:bg-[#FF8C00] transition duration-300 ease-in-out flex-1"
                      >
                        Handle Vacate
                      </button>
                    )}
                  </div>
                  
                  {editingBookingId === booking._id && (
                    <div className="mt-3">
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Enter rejection reason"
                        className="w-full p-2 text-sm border border-gray-300 rounded-md"
                      />
                      <button
                        onClick={handleRejectSubmit}
                        className="mt-2 w-full bg-[#F56565] text-white px-3 py-1 text-sm rounded-lg hover:bg-[#C53030] transition duration-300 ease-in-out"
                      >
                        Submit Rejection
                      </button>
                    </div>
                  )}
                  
                  {editingVacateBookingId === booking._id && (
                    <div className="mt-3">
                      <textarea
                        value={vacateDisputeReason}
                        onChange={(e) => setVacateDisputeReason(e.target.value)}
                        placeholder="Enter dispute reason (if rejecting)"
                        className="w-full p-2 text-sm border border-gray-300 rounded-md"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleVacateResponse("approve")}
                          className="flex-1 bg-[#2ECC71] text-white px-3 py-1 text-sm rounded-lg hover:bg-[#27AE60] transition duration-300 ease-in-out"
                        >
                          Approve Vacate
                        </button>
                        <button
                          onClick={() => handleVacateResponse("reject")}
                          className="flex-1 bg-[#F56565] text-white px-3 py-1 text-sm rounded-lg hover:bg-[#C53030] transition duration-300 ease-in-out"
                        >
                          Reject Vacate
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
        
        {/* Desktop view - Table layout */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-200 bg-white shadow-md rounded-xl">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold lg:px-6 lg:text-sm">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold lg:px-6 lg:text-sm">PG</th>
                <th className="px-4 py-3 text-left text-xs font-semibold lg:px-6 lg:text-sm">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold lg:px-6 lg:text-sm">Payment Details</th>
                <th className="px-4 py-3 text-left text-xs font-semibold lg:px-6 lg:text-sm">Vacate Details</th>
                <th className="px-4 py-3 text-left text-xs font-semibold lg:px-6 lg:text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-gray-600 lg:px-6">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => {
                  console.log(`Rendering booking ${booking._id} in table, status: ${booking.status}`);
                  return (
                    <tr
                      key={booking._id}
                      className="hover:bg-gray-100 transition duration-300 ease-in-out border-b"
                    >
                      <td className="px-4 py-3 text-xs text-gray-900 lg:px-6 lg:py-4 lg:text-sm">
                        {booking.user?.username || "Unknown User"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-900 lg:px-6 lg:py-4 lg:text-sm">
                        {booking.pg?.name || "Unknown PG"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-900 lg:px-6 lg:py-4 lg:text-sm">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                          booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          booking.status === 'pending_vacate' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'vacated' ? 'bg-purple-100 text-purple-800' :
                          booking.status === 'vacate_disputed' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-900 lg:px-6 lg:py-4 lg:text-sm">
                        {booking.status === "confirmed" && 
                         paymentDetails[booking._id] && 
                         (paymentDetails[booking._id].paymentStatus?.toLowerCase() === "completed" || 
                          paymentDetails[booking._id].paymentStatus?.toLowerCase() === "failed") ? (
                          <div className="text-xs lg:text-sm">
                            <p>Amount: ₹{paymentDetails[booking._id].totalAmount || "N/A"}</p>
                            <p>Status: {paymentDetails[booking._id].paymentStatus || "N/A"}</p>
                            <p>
                              Date: {paymentDetails[booking._id].paymentDate ? new Date(paymentDetails[booking._id].paymentDate).toLocaleDateString() : "N/A"}
                            </p>
                            <p className="truncate max-w-[200px]">
                              Razorpay Order ID: {paymentDetails[booking._id].razorpayOrderId || "N/A"}
                            </p>
                          </div>
                        ) : (
                          <span>No payment details</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-900 lg:px-6 lg:py-4 lg:text-sm">
                        {(booking.status === "pending_vacate" || booking.status === "vacate_disputed" || booking.status === "vacated") ? (
                          <div className="text-xs lg:text-sm">
                            {booking.vacateReason && <p>Reason: {booking.vacateReason}</p>}
                            {booking.vacateRequestDate && (
                              <p>Request Date: {new Date(booking.vacateRequestDate).toLocaleDateString()}</p>
                            )}
                            {booking.vacateDisputeReason && (
                              <p>Dispute Reason: {booking.vacateDisputeReason}</p>
                            )}
                            {booking.vacateResponseDate && (
                              <p>Response Date: {new Date(booking.vacateResponseDate).toLocaleDateString()}</p>
                            )}
                          </div>
                        ) : (
                          <span>No vacate details</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs lg:px-6 lg:py-4 lg:text-sm">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleConfirmClick(booking._id)}
                            className="bg-[#17BEBB] text-white px-3 py-1 text-xs rounded-lg hover:bg-[#109795] transform hover:scale-105 transition duration-300 ease-in-out lg:px-4 lg:py-1.5 lg:text-sm"
                            disabled={booking.status === "pending_vacate" || booking.status === "vacated"}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleRejectClick(booking._id)}
                            className="bg-[#F56565] text-white px-3 py-1 text-xs rounded-lg hover:bg-[#C53030] transform hover:scale-105 transition duration-300 ease-in-out lg:px-4 lg:py-1.5 lg:text-sm"
                            disabled={booking.status === "pending_vacate" || booking.status === "vacated"}
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleCompleteClick(booking._id)}
                            className="bg-[#2ECC71] text-white px-3 py-1 text-xs rounded-lg hover:bg-[#27AE60] transform hover:scale-105 transition duration-300 ease-in-out lg:px-4 lg:py-1.5 lg:text-sm"
                            disabled={booking.status === "pending_vacate" || booking.status === "vacated"}
                          >
                            Complete
                          </button>
                          {booking.status === "pending_vacate" && (
                            <button
                              onClick={() => handleVacateActionClick(booking._id)}
                              className="bg-[#FFA500] text-white px-3 py-1 text-xs rounded-lg hover:bg-[#FF8C00] transform hover:scale-105 transition duration-300 ease-in-out lg:px-4 lg:py-1.5 lg:text-sm"
                            >
                              Handle Vacate
                            </button>
                          )}
                        </div>
                        {editingBookingId === booking._id && (
                          <div className="mt-2">
                            <textarea
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Enter rejection reason"
                              className="w-full p-2 text-xs border border-gray-300 rounded-md lg:text-sm"
                            />
                            <button
                              onClick={handleRejectSubmit}
                              className="mt-2 bg-[#F56565] text-white px-3 py-1 text-xs rounded-lg hover:bg-[#C53030] transform hover:scale-105 transition duration-300 ease-in-out lg:px-4 lg:py-1.5 lg:text-sm"
                            >
                              Submit Rejection
                            </button>
                          </div>
                        )}
                        {editingVacateBookingId === booking._id && (
                          <div className="mt-2">
                            <textarea
                              value={vacateDisputeReason}
                              onChange={(e) => setVacateDisputeReason(e.target.value)}
                              placeholder="Enter dispute reason (if rejecting)"
                              className="w-full p-2 text-xs border border-gray-300 rounded-md lg:text-sm"
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleVacateResponse("approve")}
                                className="flex-1 bg-[#2ECC71] text-white px-3 py-1 text-xs rounded-lg hover:bg-[#27AE60] transform hover:scale-105 transition duration-300 ease-in-out lg:px-4 lg:py-1.5 lg:text-sm"
                              >
                                Approve Vacate
                              </button>
                              <button
                                onClick={() => handleVacateResponse("reject")}
                                className="flex-1 bg-[#F56565] text-white px-3 py-1 text-xs rounded-lg hover:bg-[#C53030] transform hover:scale-105 transition duration-300 ease-in-out lg:px-4 lg:py-1.5 lg:text-sm"
                              >
                                Reject Vacate
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};


export default AdminBookingDashboard;
