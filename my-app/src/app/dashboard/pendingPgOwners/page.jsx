"use client";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SuperAdminLayout from "../../components/superAdminDashboardLayout";

export default function PendingAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState({});
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectAdminId, setRejectAdminId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    const fetchPendingAdmins = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/proxy/pending_admins`, {
          headers: {
    "Authorization": `Bearer ${session.accessToken}`,  // ← this works
    "Content-Type": "application/json"
  },
          credentials: "include",
        });

        const result = await res.json();
        console.log("Fetched result:", result);

        if (Array.isArray(result)) {
          setAdmins(result);
        } else {
          console.error("Unexpected response format:", result);
          setAdmins([]);
          setError("Invalid response from server.");
        }
      } catch (error) {
        console.error("Error fetching pending admins:", error);
        setError("Failed to fetch pending admins.");
        setAdmins([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingAdmins();
  }, []);

  const handleApprove = async (adminId) => {
    if (!confirm("Are you sure you want to approve this admin?")) return;

    try {
      setProcessing((prev) => ({ ...prev, [adminId]: true }));
      const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/proxy/approve_admin/${adminId}`, {
        method: "POST",
        credentials: "include",
      headers: {
    "Authorization": `Bearer ${session.accessToken}`,  // ← this works
    "Content-Type": "application/json"
  },
      });

      const result = await res.json();
      if (res.ok) {
        setAdmins((prev) => prev.filter((admin) => admin._id !== adminId));
        toast.success("Admin approved successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error(`Approval failed: ${result.error}`, {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.error("Error approving admin:", error);
      toast.error("An error occurred while approving the admin.", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setProcessing((prev) => ({ ...prev, [adminId]: false }));
    }
  };

  const handleReject = (adminId) => {
    if (!confirm("Are you sure you want to reject this admin?")) return;
    setRejectAdminId(adminId);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const submitReject = async () => {
    if (!rejectReason.trim()) {
      toast.warn("Rejection cancelled: No reason provided.", {
        position: "top-right",
        autoClose: 3000,
      });
      setRejectModalOpen(false);
      return;
    }

    try {
      setProcessing((prev) => ({ ...prev, [rejectAdminId]: true }));
      const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/proxy/reject_admin/${rejectAdminId}`, {
        method: "POST",
        credentials: "include",
        headers: {
    "Authorization": `Bearer ${session.accessToken}`,  // ← this works
    "Content-Type": "application/json"
  },
        body: JSON.stringify({
          reason: rejectReason,
          role: "rejected_role",
          status: "rejected",
        }),
      });

      const result = await res.json();
      if (res.ok) {
        setAdmins((prev) => prev.filter((admin) => admin._id !== rejectAdminId));
        toast.success("Admin rejected successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error(`Rejection failed: ${result.error}`, {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.error("Error rejecting admin:", error);
      toast.error("An error occurred while rejecting the admin.", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setProcessing((prev) => ({ ...prev, [rejectAdminId]: false }));
      setRejectModalOpen(false);
      setRejectReason("");
      setRejectAdminId(null);
    }
  };

  return (
    <SuperAdminLayout>
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8 sm:text-4xl">
          Pending Admins
        </h1>

        {loading ? (
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : error ? (
          <p className="text-center text-red-600 bg-red-50 py-3 px-4 rounded-lg">
            {error}
          </p>
        ) : admins.length > 0 ? (
          <div className="space-y-6">
            {admins.map((admin) => (
              <div
                key={admin._id || admin.email}
                className="bg-white shadow-lg rounded-xl p-6 sm:p-8 transition-all duration-300 hover:shadow-xl relative"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Name</p>
                    <p className="text-lg text-gray-900">
                      {admin.username || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="text-lg text-gray-900">
                      {admin.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Phone</p>
                    <p className="text-lg text-gray-900">
                      {admin.phone || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Address</p>
                    <p className="text-lg text-gray-900">
                      {admin.pgDetails?.propertyAddress || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Registration Number
                    </p>
                    <p className="text-lg text-gray-900">
                      {admin.pgDetails?.registrationNumber ||
                        admin.registrationNumber ||
                        "N/A"}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Documents
                  </p>
                  {admin.pgDetails ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(admin.pgDetails).map(([key, value]) =>
                        key !== "propertyAddress" &&
                        key !== "registrationNumber" &&
                        value &&
                        value.startsWith("https://") ? (
                          <a
                            key={key}
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-600 hover:text-teal-800 underline text-sm truncate transition-colors duration-200"
                          >
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </a>
                        ) : null
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No documents available.
                    </p>
                  )}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={() => handleApprove(admin._id)}
                    disabled={processing[admin._id]}
                    className={`py-2 px-6 rounded-lg text-white font-medium transition-all duration-200 ${
                      processing[admin._id]
                        ? "bg-green-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    }`}
                  >
                    {processing[admin._id] ? "Processing..." : "Approve"}
                  </button>
                  <button
                    onClick={() => handleReject(admin._id)}
                    disabled={processing[admin._id]}
                    className={`py-2 px-6 rounded-lg text-white font-medium transition-all duration-200 ${
                      processing[admin._id]
                        ? "bg-red-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                    }`}
                  >
                    {processing[admin._id] ? "Processing..." : "Reject"}
                  </button>
                </div>

                {rejectModalOpen && rejectAdminId === admin._id && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                      <h2 className="text-xl font-bold text-gray-800 mb-4">
                        Reason for Rejection
                      </h2>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        rows="4"
                        placeholder="Enter the reason for rejection"
                      ></textarea>
                      <div className="mt-4 flex justify-end space-x-4">
                        <button
                          onClick={() => setRejectModalOpen(false)}
                          className="py-2 px-4 rounded-lg bg-gray-300 text-gray-800 hover:bg-gray-400 transition-colors duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={submitReject}
                          className="py-2 px-4 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600 bg-white py-4 px-6 rounded-lg shadow">
            No pending admins found.
          </p>
        )}
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
    </SuperAdminLayout>
  );

}
