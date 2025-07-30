"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function UserComplaints() {
  const { data: session, status } = useSession();
  const [complaints, setComplaints] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 10;

  const fetchComplaints = async () => {
    if (status !== "authenticated") return;
    setLoading(true);
    try {
        const userId=session.user.id;
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/userComplaints/${userId}?page=${page}&limit=${limit}`, {
        credentials:"include"
      });
      const data = await res.json();
      if (res.ok) {
        setComplaints(data.complaints);
        setHasMore(data.hasMore);
        setTotal(data.total);
      } else {
        toast.error(data.message );
      }
    } catch (err) {
      toast.error("Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, status]);

  if (status === "loading") {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (status !== "authenticated") {
    return <div className="text-center py-4">Please sign in to view your complaints.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-teal-700 mb-6">My Complaints</h1>
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
        </div>
      )}
      {complaints.length === 0 && !loading && (
        <p className="text-gray-600 text-center">No complaints found.</p>
      )}
      <div className="space-y-6">
        {complaints.map((complaint) => (
          <div key={complaint._id} className="bg-white shadow-md rounded-lg p-6 border border-teal-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{complaint.Name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{complaint.Email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone Number</p>
                <p className="font-medium">{complaint.PhoneNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Enquiry Type</p>
                <p className="font-medium">{complaint.EnquiryType}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Message</p>
                <p className="font-medium">{complaint.Message}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p
                  className={`font-medium ${
                    complaint.status === "Open"
                      ? "text-yellow-600"
                      : complaint.status === "In Progress"
                      ? "text-blue-600"
                      : complaint.status === "Resolved"
                      ? "text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  {complaint.status}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created At</p>
                <p className="font-medium">{new Date(complaint.createdAt).toLocaleString()}</p>
              </div>
            </div>
            {complaint.replies.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-600 mb-2">Admin Replies</p>
                <div className="space-y-4">
                  {complaint.replies.map((reply, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-md border border-gray-200">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{reply.adminId?.name || "Admin"}</span> replied on{" "}
                        {new Date(reply.createdAt).toLocaleString()}
                      </p>
                      <p className="mt-2">{reply.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 disabled:bg-gray-400"
        >
          Previous
        </button>
        <p className="text-gray-600">
          Page {page} of {Math.ceil(total / limit)}
        </p>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={!hasMore}
          className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 disabled:bg-gray-400"
        >
          Next
        </button>
      </div>
    </div>
  );
}