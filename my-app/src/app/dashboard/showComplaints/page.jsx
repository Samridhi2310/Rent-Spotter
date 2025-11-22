"use client";

import SuperAdminLayout from "@/app/components/superAdminDashboardLayout";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef, useCallback } from "react";

const SuperAdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [replyModal, setReplyModal] = useState({ open: false, complaintId: null, message: "" });
  const [archiveConfirm, setArchiveConfirm] = useState({ open: false, complaintId: null });
  const observer = useRef();
  const complaintIdsRef = useRef(new Set());
  const { data: session, status } = useSession();
  const [adminId, setAdminId] = useState();

  useEffect(() => {
    if (session?.user?.id) {
      setAdminId(session.user.id);
    }
  }, [session]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const lastComplaintRef = useCallback(
    (node) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    const fetchComplaints = async (pageNum) => {
      try {
        setLoading(true);
        const url = `/fetchComplaints?page=${pageNum}&limit=10${
          filterStatus !== "All" ? `&status=${filterStatus}` : ""
        }`;
        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch complaints");
        const data = await res.json();

        const newComplaints = data.complaints.filter(
          (complaint) => !complaintIdsRef.current.has(complaint._id)
        );
        newComplaints.forEach((complaint) => complaintIdsRef.current.add(complaint._id));

        setComplaints((prev) => [...prev, ...newComplaints]);
        setHasMore(data.hasMore);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    if (hasMore) fetchComplaints(page);
  }, [page, filterStatus]); // Added filterStatus to dependency array

  const markInProgress = async (complaintId) => {
    try {
      const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/proxy/complaints/${complaintId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "In Progress" }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setComplaints((prev) =>
        prev.map((c) => (c._id === complaintId ? { ...c, status: "In Progress" } : c))
      );
      setError(null);
    } catch (err) {
      setError("Error updating status: " + err.message);
    }
  };

  const markResolved = async (complaintId) => {
    try {
      const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/proxy/complaints/${complaintId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "Resolved" }),
      });
      if (!res.ok) throw new Error("Failed to resolve complaint");
      setComplaints((prev) =>
        prev.map((c) => (c._id === complaintId ? { ...c, status: "Resolved" } : c))
      );
      setError(null);
    } catch (err) {
      setError("Error resolving complaint: " + err.message);
    }
  };

  const addReply = async (complaintId, message) => {
    if (!adminId) {
      setError("Admin ID is missing. Please log in again.");
      return;
    }
    if (!message.trim()) {
      setError("Please enter a reply message");
      return;
    }
    try {
      const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/proxy/complaints/${complaintId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message, adminId }),
      });
      if (!res.ok) throw new Error("Failed to add reply");
      const data = await res.json();
      setComplaints((prev) =>
        prev.map((c) =>
          c._id === complaintId
            ? {
                ...c,
                replies: [...(c.replies || []), data.reply],
                ...(data.complaint?.status && { status: data.complaint.status }),
              }
            : c
        )
      );
      setReplyModal({ open: false, complaintId: null, message: "" });
      setError(null);
    } catch (err) {
      setError("Error adding reply: " + err.message);
    }
  };

  const archiveComplaint = async (complaintId) => {
    try {
      const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/proxy/complaints/${complaintId}/archive`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to archive complaint");
      setComplaints((prev) =>
        prev.map((c) => (c._id === complaintId ? { ...c, isArchived: true, status: "Archived" } : c))
      );
      setArchiveConfirm({ open: false, complaintId: null });
      setError(null);
    } catch (err) {
      setError("Error archiving complaint: " + err.message);
    }
  };

  const handleFilterChange = (newStatus) => {
    setFilterStatus(newStatus);
    setPage(1);
    setHasMore(true);
    setComplaints([]); // Clear complaints for new filter
    complaintIdsRef.current.clear();
    setLoading(true); // Show loading state immediately
  };

  if (loading && page === 1)
    return <p className="text-center mt-8 text-gray-600">Loading complaints...</p>;
  if (error)
    return <p className="text-center mt-8 text-red-500">Error: {error}</p>;

  return (
    <SuperAdminLayout>
      <div className="p-4 max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold text-teal-700 mb-4">All User Complaints</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="mb-4">
          <label className="mr-2 text-gray-700">Filter by Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => {
              e.preventDefault(); // Prevent default browser behavior
              handleFilterChange(e.target.value); // Update filter status
            }}
            className="p-2 border rounded-md"
          >
            <option value="All">All (Excluding Archived)</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        {complaints.length === 0 ? (
          <p className="text-gray-500">No complaints found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complaints.map((item, index) => (
              <div
                key={item._id}
                ref={index === complaints.length - 1 ? lastComplaintRef : null}
                className="bg-white shadow-md rounded-2xl p-4 border hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p>
                      <span className="font-semibold">Name:</span> {item.Name}
                    </p>
                    <p>
                      <span className="font-semibold">Email:</span> {item.Email}
                    </p>
                    <p>
                      <span className="font-semibold">Phone:</span> {item.PhoneNumber}
                    </p>
                    <p>
                      <span className="font-semibold">Type:</span> {item.EnquiryType}
                    </p>
                    <p>
                      <span className="font-semibold">Message:</span> {item.Message}
                    </p>
                    <p>
                      <span className="font-semibold">Status:</span>{" "}
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          item.status === "Open"
                            ? "bg-red-100 text-red-700"
                            : item.status === "In Progress"
                            ? "bg-yellow-100 text-yellow-700"
                            : item.status === "Resolved"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item.status || "Open"}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold">Submitted:</span>{" "}
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {item.status === "Open" && (
                      <button
                        onClick={() => markInProgress(item._id)}
                        className="px-2 py-1 bg-yellow-600 text-white rounded-md text-sm hover:bg-yellow-700"
                      >
                        Mark In Progress
                      </button>
                    )}
                    {item.status !== "Resolved" && item.status !== "Archived" && (
                      <button
                        onClick={() => markResolved(item._id)}
                        className="px-2 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                      >
                        Mark Resolved
                      </button>
                    )}
                    <button
                      onClick={() =>
                        setReplyModal({ open: true, complaintId: item._id, message: "" })
                      }
                      className="px-2 py-1 bg-teal-600 text-white rounded-md text-sm hover:bg-teal-700"
                      disabled={!adminId}
                      title={!adminId ? "Admin ID missing. Please log in again." : ""}
                    >
                      Reply
                    </button>
                    {item.status !== "Archived" && (
                      <button
                        onClick={() =>
                          setArchiveConfirm({ open: true, complaintId: item._id })
                        }
                        className="px-2 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </div>

                {item.replies && item.replies.length > 0 && (
                  <div className="mt-4 border-t pt-2">
                    <h4 className="font-semibold text-gray-700">Replies:</h4>
                    {item.replies.map((reply, index) => (
                      <div
                        key={index}
                        className="mt-2 p-2 bg-gray-50 rounded-md text-sm text-gray-600"
                      >
                        <p>
                          <span className="font-semibold">Admin:</span>{" "}
                          {reply.adminId?.name || reply.adminId?.email || reply.adminId || "Unknown Admin"}
                        </p>
                        <p>
                          <span className="font-semibold">Message:</span> {reply.message}
                        </p>
                        <p>
                          <span className="font-semibold">Date:</span>{" "}
                          {new Date(reply.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {loading && page > 1 && (
          <p className="text-center mt-8 text-gray-600">Loading more complaints...</p>
        )}
        {!hasMore && complaints.length > 0 && (
          <p className="text-center mt-8 text-gray-500">No more complaints to load.</p>
        )}

        {replyModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Add Reply</h3>
              <textarea
                value={replyModal.message}
                onChange={(e) => setReplyModal({ ...replyModal, message: e.target.value })}
                className="w-full p-2 border rounded-md"
                rows="4"
                placeholder="Enter your reply..."
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setReplyModal({ open: false, complaintId: null, message: "" })}
                  className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => addReply(replyModal.complaintId, replyModal.message)}
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                  disabled={!replyModal.message.trim()}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {archiveConfirm.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Confirm Archiving</h3>
              <p>Are you sure you want to archive this complaint?</p>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setArchiveConfirm({ open: false, complaintId: null })}
                  className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => archiveComplaint(archiveConfirm.complaintId)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Archive
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminComplaints;