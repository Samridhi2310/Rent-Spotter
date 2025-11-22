"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/app/adminDashboardLayout";
import toast, { Toaster } from "react-hot-toast";

export default function PgManagement() {
  const { data: session, status } = useSession();
  const [pgDetails, setPgDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editPg, setEditPg] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [formError, setFormError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // State for delete confirmation
  const router = useRouter();
  const observer = useRef(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  // Fetch PG details with pagination
  const fetchPgDetails = async (pageNum, reset = false) => {
    if (status !== "authenticated" || !session?.user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `/my-pgs/${session.user.id}?page=${pageNum}&limit=10`,
        { withCredentials: true }
      );
      const newData = response.data.data || [];
      const total = response.data.total || newData.length;
      const totalPagesCalc = Math.ceil(total / 10);

      setPgDetails((prev) => (reset ? newData : [...prev, ...newData]));
      setTotalPages(totalPagesCalc);
      setHasMore(pageNum < totalPagesCalc && newData.length > 0);
      setLoading(false);
      setInitialLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch PG details");
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Initial fetch and page change
  useEffect(() => {
    if (session && status === "authenticated") {
      fetchPgDetails(page, true);
    }
  }, [session, status, page]);

  // Pagination handlers
  const handlePrevious = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  // Optional: Intersection Observer for infinite scrolling (disabled by default)
  const lastPgElementRef = useCallback(
    (node) => {
    },
    [loading, hasMore]
  );

  // Cleanup observer on component unmount
  useEffect(() => {
    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, []);

  // Handle delete PG
  const handleDelete = async (pgId) => {
    try {
      await axios.delete(`/pg/${pgId}`, {
        withCredentials: true,
      });
      setPgDetails(pgDetails.filter((pg) => pg._id !== pgId));
      if (pgDetails.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchPgDetails(page, true);
      }
      toast.success("PG deleted successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete PG");
    }
    setShowDeleteConfirm(null); // Close confirmation modal
  };

  // Show delete confirmation modal
  const handleDeleteClick = (pgId) => {
    setShowDeleteConfirm(pgId);
  };

  // Handle file change for image uploads
  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  // Handle update PG with validation
  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Validate required address fields
    const requiredAddressFields = ["street", "city", "state", "pincode"];
    const addressErrors = requiredAddressFields.filter(
      (key) => !editPg.address[key] || editPg.address[key].trim() === ""
    );

    if (addressErrors.length > 0) {
      setFormError(
        `Please fill in the following required address fields: ${addressErrors.join(", ")}`
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.append("sharing", editPg.sharing || "");
      formData.append("name", editPg.name || "");
      formData.append("description", editPg.description || "");
      formData.append("genderAllowed", editPg.genderAllowed || "");
      formData.append("rent", editPg.rent || "");
      formData.append("availability", editPg.availability);

      // Append address fields
      requiredAddressFields.forEach((key) => {
        formData.append(`address[${key}]`, editPg.address[key] || "");
      });
      formData.append(`address[landmark]`, editPg.address.landmark || "");

      // Append charges
      Object.entries(editPg.charges || {}).forEach(([key, value]) => {
        formData.append(`charges[${key}]`, value || "");
      });

      // Append arrays
      (editPg.amenities || []).forEach((amenity) =>
        formData.append("amenities[]", amenity)
      );
      (editPg.rules || []).forEach((rule) => formData.append("rules[]", rule));

      // Append images
      Array.from(selectedFiles).forEach((file) => {
        formData.append("images", file);
      });

      // Debug: Log FormData contents
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
      console.log("editPg.address:", editPg.address);

      const response = await axios.put(`/api/proxy/pg/${editPg._id}`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setPage(1);
      await fetchPgDetails(1, true);
      setEditPg(null);
      setSelectedFiles([]);
      setFormError(null);
      toast.success("PG updated successfully");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to update PG";
      setFormError(errorMessage);
      console.error("Update error:", err.response?.data);
      toast.error(errorMessage);
    }
  };

  // Open edit form with default address values
  const openEditForm = (pg) => {
    setEditPg({
      ...pg,
      rules: pg.rules || [],
      amenities: pg.amenities || [],
      address: {
        street: pg.address?.street || "",
        city: pg.address?.city || "",
        state: pg.address?.state || "",
        pincode: pg.address?.pincode || "",
        landmark: pg.address?.landmark || "",
      },
      charges: pg.charges || {
        electricity: "",
        maintenance: "",
        deposit: "",
      },
    });
    setFormError(null);
  };

  // Handle input change for edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [section, key] = name.split(".");
      setEditPg((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value,
        },
      }));
    } else {
      setEditPg((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle array input change (rules, amenities)
  const handleArrayChange = (e, field) => {
    setEditPg((prev) => ({
      ...prev,
      [field]: e.target.value.split(",").map((item) => item.trim()),
    }));
  };

  // Retry failed fetch
  const handleRetry = () => {
    setError(null);
    fetchPgDetails(page, true);
  };

  if (initialLoading && status === "loading") {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="text-xl sm:text-2xl font-semibold text-gray-700 animate-pulse">
            Loading...
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
          <div className="text-xl sm:text-2xl font-semibold text-red-600 mb-4">
            {error}
          </div>
          <button
            onClick={handleRetry}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base"
          >
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8 lg:py-12">
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-6 sm:mb-8 text-center">
            Manage Your PG Listings
          </h1>

          {/* PG Listings */}
          {pgDetails.length === 0 && !loading && !initialLoading ? (
            <div className="text-center text-base sm:text-lg font-semibold text-gray-700">
              No PG listings available
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {pgDetails.map((pg, index) => {
                const isLastElement = pgDetails.length === index + 1;
                return (
                  <div
                    key={pg._id}
                    ref={isLastElement ? lastPgElementRef : null}
                    className="bg-white shadow-lg rounded-xl p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-200"
                  >
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-2 sm:mb-3 truncate">
                      {pg.name || "Unnamed PG"}
                    </h2>
                    <p className="text-gray-600 mb-3 sm:mb-4 line-clamp-3 text-sm sm:text-base">
                      {pg.description || "No description available"}
                    </p>
                    <p className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                      Rent: ₹{pg.rent || "N/A"}
                    </p>
                    <p className="text-gray-600 mb-2 text-sm sm:text-base">
                      Sharing: {pg.sharing || "N/A"}
                    </p>
                    <p className="text-gray-600 mb-2 text-sm sm:text-base">
                      Gender Allowed: {pg.genderAllowed || "N/A"}
                    </p>
                    <p className="text-gray-600 mb-2 text-sm sm:text-base">
                      Availability: {pg.availability ? "Available" : "Not Available"}
                    </p>
                    <p className="text-gray-600 mb-2 text-sm sm:text-base">
                      Rules: {pg.rules?.join(", ") || "N/A"}
                    </p>
                    <p className="text-gray-600 mb-2 text-sm sm:text-base">
                      Amenities: {pg.amenities?.join(", ") || "N/A"}
                    </p>
                    <p className="text-gray-600 mb-2 text-sm sm:text-base">
                      Address:{" "}
                      {pg.address
                        ? `${pg.address.street}, ${pg.address.city}, ${pg.address.state} - ${pg.address.pincode} (Landmark: ${pg.address.landmark || "N/A"})`
                        : "N/A"}
                    </p>
                    <p className="text-gray-600 mb-2 text-sm sm:text-base">
                      Charges: Electricity: ₹{pg.charges?.electricity || "N/A"},
                      Maintenance: ₹{pg.charges?.maintenance || "N/A"}, Deposit: ₹
                      {pg.charges?.deposit || "N/A"}
                    </p>
                    {pg.images?.length > 0 && (
                      <div className="mb-3 sm:mb-4">
                        <p className="text-gray-600 mb-2 text-sm sm:text-base">
                          Images:
                        </p>
                        <div className="flex space-x-2 overflow-x-auto hide-scrollbar">
                          {pg.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`PG Image ${idx + 1}`}
                              className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 object-cover rounded-md hover:scale-105 transition-transform duration-200"
                              onError={(e) => {
                                e.target.src = "/placeholder-image.jpg";
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-3 sm:mt-4">
                      <button
                        onClick={() => openEditForm(pg)}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(pg._id)}
                        className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm sm:text-base"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md shadow-2xl">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
                  Confirm Delete
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  Are you sure you want to delete this PG? This action cannot be undone.
                </p>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={() => handleDelete(showDeleteConfirm)}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm sm:text-base"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-center mt-6 sm:mt-8">
              <div className="text-base sm:text-lg font-semibold text-gray-700 animate-pulse">
                Loading PGs...
              </div>
            </div>
          )}

          {/* No More Data Message */}
          {!hasMore && pgDetails.length > 0 && (
            <div className="flex justify-center mt-6 sm:mt-8">
              <div className="text-base sm:text-lg font-semibold text-gray-700">
                No more PG listings to show
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex justify-center items-center mt-6 sm:mt-8 space-x-3 sm:space-x-4">
            <button
              onClick={handlePrevious}
              disabled={page === 1}
              className="bg-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              Previous
            </button>
            <span className="text-base sm:text-lg font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={page === totalPages || !hasMore}
              className="bg-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              Next
            </button>
          </div>

          {/* Edit Form Modal */}
          {editPg && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
                  Edit PG Details
                </h2>
                {formError && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm sm:text-base">
                    {formError}
                  </div>
                )}
                <form onSubmit={handleUpdate} className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      PG Name
                    </label>
                    <input
                      name="name"
                      placeholder="PG Name"
                      value={editPg.name || ""}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      placeholder="Description"
                      value={editPg.description || ""}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base p-2"
                      rows="4"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Gender Allowed
                    </label>
                    <select
                      name="genderAllowed"
                      value={editPg.genderAllowed || ""}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base p-2"
                      required
                    >
                      <option value="" disabled>
                        Select Gender
                      </option>
                      <option value="Boys">Boys</option>
                      <option value="Girls">Girls</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Sharing
                    </label>
                    <select
                      name="sharing"
                      value={editPg.sharing || ""}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base p-2"
                      required
                    >
                      <option value="" disabled>
                        Select Sharing
                      </option>
                      <option value="Single">Single</option>
                      <option value="Double">Double</option>
                      <option value="Triple">Triple</option>
                      <option value="Quad">Quad</option>
                      <option value="Bunk Bed">Bunk Bed</option>
                    </select>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Address
                    </h4>
                    {["street", "city", "state", "pincode", "landmark"].map(
                      (key) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 capitalize">
                            {key}
                          </label>
                          <input
                            name={`address.${key}`}
                            placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                            value={editPg.address[key] || ""}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base p-2 mb-2"
                            required={key !== "landmark"}
                          />
                        </div>
                      )
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Rent
                    </label>
                    <input
                      type="number"
                      name="rent"
                      placeholder="Rent"
                      value={editPg.rent || ""}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Amenities (comma separated)
                    </label>
                    <input
                      name="amenities"
                      placeholder="Amenities (comma separated)"
                      value={editPg.amenities?.join(",") || ""}
                      onChange={(e) => handleArrayChange(e, "amenities")}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base p-2"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Charges
                    </h4>
                    {["electricity", "maintenance", "deposit"].map((key) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 capitalize">
                          {key}
                        </label>
                        <input
                          type="number"
                          name={`charges.${key}`}
                          placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                          value={editPg.charges[key] || ""}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base p-2 mb-2"
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Rules (comma separated)
                    </label>
                    <input
                      name="rules"
                      placeholder="Rules (comma separated)"
                      value={editPg.rules?.join(",") || ""}
                      onChange={(e) => handleArrayChange(e, "rules")}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Upload Images
                    </label>
                    <input
                      type="file"
                      name="images"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base p-2"
                    />
                  </div>
                  {editPg.images?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Current Images
                      </h4>
                      <div className="flex space-x-2 overflow-x-auto hide-scrollbar">
                        {editPg.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`PG Image ${idx + 1}`}
                            className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 object-cover rounded-md hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              e.target.src = "/placeholder-image.jpg";
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        name="availability"
                        checked={editPg.availability}
                        onChange={(e) =>
                          setEditPg((prev) => ({
                            ...prev,
                            availability: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span>Available</span>
                    </label>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-3 sm:pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditPg(null)}
                      className="flex-1 bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}