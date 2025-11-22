"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { FaHamburger } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import { useSession, signOut } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [applicationData, setApplicationData] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    gender: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingUserData, setFetchingUserData] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState(null);
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const profileDropdownRef = useRef(null);
  const profileButtonRef = useRef(null);
  const hamburgerRef = useRef(null);
  const menuRef = useRef(null);
  const statusModalRef = useRef(null);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleProfile = () => setIsProfileOpen((prev) => !prev);

  const handleTrackStatus = async () => {
    if (session?.user?.id) {
      setStatusLoading(true);
      setStatusError("");
      try {
        const res = await fetch(`/api/proxy/admin/${session.user.id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const result = await res.json();
        if (res.ok) {
          setApplicationData({
            status: result.applicationStatus,
            role: result.role,
            rejectionReason: result.rejectionReason,
          });
          setShowStatusModal(true);
          setIsProfileOpen(false);
        } else {
          throw new Error(result.message || "Failed to fetch application status");
        }
      } catch (error) {
        console.error("Error fetching application status:", error);
        setStatusError(error.message || "Failed to fetch application status");
        toast.error(error.message || "Failed to fetch application status", {
          position: "top-center",
          duration: 5000,
        });
      } finally {
        setStatusLoading(false);
      }
    }
  };

  const fetchUserData = async () => {
    if (session?.user?.id) {
      setFetchingUserData(true);
      try {
        const response = await fetch(`/api/proxy/user/${session.user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        
        const userData = await response.json();
        
        if (!response.ok) {
          throw new Error(userData.message || "Failed to fetch user data");
        }
        
        setFormData({
          username: userData.username || "",
          email: userData.email || "",
          password: "",
          gender: userData.gender || "",
          phone: userData.phone || "",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to fetch user data", {
          position: "top-center",
          duration: 3000,
        });
      } finally {
        setFetchingUserData(false);
      }
    }
  };

  const handleOpenUpdateModal = () => {
    fetchUserData();
    setShowUpdateModal(true);
    setIsProfileOpen(false);
  };

  const handleLogout = async (event) => {
    event.stopPropagation();
    try {
      await signOut({ redirect: false });
      toast.success("Logged out successfully!", {
        position: "top-center",
        duration: 3000,
      });
      setIsProfileOpen(false);
      setTimeout(() => {
        window.location.href = "/signin";
      }, 1000);
    } catch (error) {
      toast.error("Logout failed", {
        position: "top-center",
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        isProfileOpen &&
        profileDropdownRef.current &&
        profileButtonRef.current &&
        !profileDropdownRef.current.contains(event.target) &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }

      if (
        isOpen &&
        hamburgerRef.current &&
        menuRef.current &&
        !hamburgerRef.current.contains(event.target) &&
        !menuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }

      if (
        showStatusModal &&
        statusModalRef.current &&
        !statusModalRef.current.contains(event.target)
      ) {
        setShowStatusModal(false);
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isProfileOpen, isOpen, showStatusModal]);

  const handleUpdate = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      if (
        !formData.username &&
        !formData.email &&
        !formData.password &&
        !formData.gender &&
        !formData.phone
      ) {
        throw new Error("At least one field must be provided");
      }
      if (
        formData.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      ) {
        throw new Error("Invalid email format");
      }

      const updatePromise = async () => {
        const updateResponse = await fetch(
          `/user/${session.user.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
            credentials: "include",
          }
        );
        const updateData = await updateResponse.json();

        if (!updateResponse.ok) {
          throw new Error(updateData.message || "Update failed");
        }

        const getResponse = await fetch(
          `/user/${session.user.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        const userData = await getResponse.json();

        if (!getResponse.ok) 
        {
          throw new Error(
            userData.message || "Failed to fetch updated user data"
          );
        }

        setUpdatedProfile({
          name: userData.username,
          email: userData.email,
        });

        await update();
        return userData;
      };

      await toast.promise(updatePromise(), {
        loading: "Updating profile...",
        success: "Profile updated successfully!",
        error: (err) => `${err.message}`,
      });

      setTimeout(() => {
        setShowUpdateModal(false);
        setFormData({
          username: "",
          email: "",
          password: "",
          gender: "",
          phone: "",
        });
      }, 1500);
    } catch (err) {
      setError(err.message || "Update failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminUpdate = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      if (
        !formData.username &&
        !formData.email &&
        !formData.password &&
        !formData.gender &&
        !formData.phone
      ) {
        throw new Error("At least one field must be provided");
      }
      if (
        formData.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      ) {
        throw new Error("Invalid email format");
      }

      const updatePromise = async () => {
        const updateResponse = await fetch(
          `/admin/${session.user.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
            credentials: "include",
          }
        );
        const updateData = await updateResponse.json();

        if (!updateResponse.ok) {
          throw new Error(updateData.message || "Update failed");
        }

        const getResponse = await fetch(
          `/user/${session.user.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        const userData = await getResponse.json();

        if (!getResponse.ok) {
          throw new Error(
            userData.message || "Failed to fetch updated user data"
          );
        }

        setUpdatedProfile({
          name: userData.username,
          email: userData.email,
        });

        await update();
        return userData;
      };

      await toast.promise(updatePromise(), {
        loading: "Updating profile...",
        success: "Profile updated successfully!",
        error: (err) => `${err.message}`,
      });

      setTimeout(() => {
        setShowUpdateModal(false);
        setFormData({
          username: "",
          email: "",
          password: "",
          gender: "",
          phone: "",
        });
      }, 1500);
    } catch (err) {
      setError(err.message || "Update failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (event) => {
    event.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      const deletePromise = async () => {
        const response = await fetch(
          `/user/${session.user.id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Delete failed");
        }
        return data;
      };

      await toast.promise(deletePromise(), {
        loading: "Deleting account...",
        success: "Account deleted successfully!",
        error: (err) => `${err.message}`,
      });

      await signOut({ redirect: false });
      setIsProfileOpen(false);
      setShowDeleteConfirm(false);
      window.location.href = "/signin";
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.message || "Delete failed", {
        position: "top-center",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const displayName = updatedProfile?.name || session?.user?.name || "User";
  const displayEmail = updatedProfile?.email || session?.user?.email || "";
  const userRole = session?.user?.role;

  const ProfileDropdown = () => (
    <div
      ref={profileDropdownRef}
      onClick={(e) => e.stopPropagation()}
      className={`absolute right-0 mt-4 min-w-[12rem] max-w-full bg-white rounded-lg shadow-lg p-4 border border-teal-300 transition-all duration-200 ease-in-out ${
        isProfileOpen
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-2 pointer-events-none"
      } z-[100]`}
    >
      <p className="text-sm font-semibold text-gray-800 truncate">
        {displayName}
      </p>
      <p className="text-sm text-gray-600 mb-4 truncate">{displayEmail}</p>

      {userRole === "user" ? (
        <>
          <button
            onClick={handleOpenUpdateModal}
            className="w-full bg-teal-600 text-white px-3 py-1 rounded-md hover:bg-teal-700 transition-colors duration-200 mb-2"
            disabled={isLoading}
          >
            Update Profile
          </button>
          <Link
            href="/dashboard/userBookings"
            onClick={() => setIsProfileOpen(false)}
            className="w-full block text-center bg-teal-600 text-white px-3 py-1 rounded-md hover:bg-teal-700 transition-colors duration-200 mb-2"
          >
            Show Bookings
          </Link>
          <Link
            href="/dashboard/userComplaints"
            onClick={() => setIsProfileOpen(false)}
            className="w-full block text-center bg-teal-600 text-white px-3 py-1 rounded-md hover:bg-teal-700 transition-colors duration-200 mb-2"
          >
            Show Complaints
          </Link>
          <button
            onClick={handleDelete}
            className="w-full bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors duration-200 mb-2"
            disabled={isLoading}
          >
            Delete Account
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-teal-600 text-white px-3 py-1 rounded-md hover:bg-teal-700 transition-colors duration-200"
            disabled={isLoading}
          >
            Logout
          </button>
        </>
      ) : userRole === "admin" ? (
        <>
          <button
            onClick={handleOpenUpdateModal}
            className="w-full bg-teal-600 text-white px-3 py-1 rounded-md hover:bg-teal-700 transition-colors duration-200 mb-2"
            disabled={isLoading}
          >
            Update Profile
          </button>
          <button
            onClick={handleTrackStatus}
            className="w-full bg-teal-600 text-white px-3 py-1 rounded-md hover:bg-teal-700 transition-colors duration-200 mb-2"
            disabled={statusLoading}
          >
            {statusLoading ? "Loading..." : "Track Application Status"}
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-teal-600 text-white px-3 py-1 rounded-md hover:bg-teal-700 transition-colors duration-200"
            disabled={isLoading}
          >
            Logout
          </button>
        </>
      ) : userRole === "superadmin" ? (
        <>
          <button
            onClick={handleOpenUpdateModal}
            className="w-full bg-teal-600 text-white px-3 py-1 rounded-md hover:bg-teal-700 transition-colors duration-200 mb-2"
            disabled={isLoading}
          >
            Update Profile
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-teal-600 text-white px-3 py-1 rounded-md hover:bg-teal-700 transition-colors duration-200"
            disabled={isLoading}
          >
            Logout
          </button>
        </>
      ) : ["pending_admin", "rejected_admin"].includes(userRole) ? (
        <>
          <button
            onClick={handleOpenUpdateModal}
            className="w-full bg-teal-600 text-white px-3 py-1 rounded-md hover:bg-teal-700 transition-colors duration-200 mb-2"
            disabled={isLoading}
          >
            Update Profile
          </button>
          <button
            onClick={handleTrackStatus}
            className="w-full bg-teal-600 text-white px-3 py-1 rounded-md hover:bg-teal-700 transition-colors duration-200 mb-2"
            disabled={statusLoading}
          >
            {statusLoading ? "Loading..." : "Track Application Status"}
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-teal-600 text-white px-3 py-1 rounded-md hover:bg-teal-700 transition-colors duration-200"
            disabled={isLoading}
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <button
            onClick={handleLogout}
            className="w-full bg-teal-600 text-white px-3 py-1 rounded-md hover:bg-teal-700 transition-colors duration-200"
            disabled={isLoading}
          >
            Logout
          </button>
        </>
      )}
    </div>
  );

  const ProfileButton = () => (
    <button
      ref={profileButtonRef}
      onClick={toggleProfile}
      className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden bg-teal-600 text-white focus:outline-none hover:bg-teal-700 transition-colors duration-200"
      aria-label="Toggle profile"
    >
      {session?.user?.image ? (
        <img
          src={session.user.image}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-lg font-semibold">
          {displayName.charAt(0).toUpperCase()}
        </span>
      )}
    </button>
  );

  const getStatusMessage = (status) => {
    switch (status) {
      case "approved":
        return "You have successfully become a PG owner! You can now access the PG owner dashboard.";
      case "rejected":
      case "rejected_admin":
        return "Your application has been rejected by the admin due to some reason which is shown below.";
      case "pending":
      case "pending_admin":
      default:
        return "Your application is currently under review by admin.";
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-teal-700 text-white shadow-md z-50 h-16 md:h-.unit-5xl">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#333",
            color: "#fff",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto h-full">
        <div className="flex items-center space-x-4">
          <div className="text-2xl font-bold tracking-tight">
            <img
              src="/WhatsApp Image 2025-04-25 at 7.45.13 AM.jpeg"
              alt="Logo"
              className="h-8 sm:h-10 md:h-12 lg:h-14 w-auto object-contain"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            ref={hamburgerRef}
            className="md:hidden text-2xl focus:outline-none hover:text-teal-200 transition-colors duration-200"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <FaHamburger />
          </button>

          <div className="md:hidden relative">
            {session?.user && (
              <>
                <ProfileButton />
                <ProfileDropdown />
              </>
            )}
          </div>
        </div>

        <ul
          ref={menuRef}
          className={`${
            isOpen ? "block" : "hidden"
          } md:flex md:items-center md:space-x-8 w-full md:w-auto absolute md:static top-16 left-0 bg-teal-700 md:bg-transparent p-4 md:p-0 transition-all duration-200 ease-in-out`}
        >
          <li className="py-2 md:py-0">
            <Link
              href="/"
              className="block text-lg hover:text-teal-200 transition-colors duration-200"
            >
              Home
            </Link>
          </li>
          <li className="py-2 md:py-0">
            <Link
              href="/aboutUs"
              className="block text-lg hover:text-teal-200 transition-colors duration-200"
            >
              About Us
            </Link>
          </li>
          <li className="py-2 md:py-0">
            <Link
              href="/contactUs"
              className="block text-lg hover:text-teal-200 transition-colors duration-200"
            >
              Contact Us
            </Link>
          </li>
          <li className="py-2 md:py-0">
            <Link
              href="/registerPgOwner"
              className="block text-lg hover:text-teal-200 transition-colors duration-200"
            >
              Register As PG Owner
            </Link>
          </li>
          {!session?.user && (
            <li className="py-2 md:py-0">
              <Link
                href="/signup"
                className="block text-lg hover:text-teal-200 transition-colors duration-200"
              >
                SignUp/Login
              </Link>
            </li>
          )}
          <li className="py-2 md:py-0 relative hidden md:block">
            {session?.user ? (
              <>
                <ProfileButton />
                <ProfileDropdown />
              </>
            ) : (
              <></>
            )}
          </li>
        </ul>

        {showUpdateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[200]">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Update Profile
              </h2>
              {error && <p className="text-red-600 mb-2">{error}</p>}

              {fetchingUserData ? (
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                  <span className="ml-2 text-gray-600">Loading user data...</span>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="border p-2 mb-2 w-full text-gray-800"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="border p-2 mb-2 w-full text-gray-800"
                  />
                  <input
                    type="password"
                    placeholder="New Password (leave blank to keep current)"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="border p-2 mb-2 w-full text-gray-800"
                  />
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    className="border p-2 mb-2 w-full text-gray-800"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unknown">Unknown</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="border p-2 mb-2 w-full text-gray-800"
                  />
                </>
              )}

              <div className="flex justify-end mt-4">
                <button
                  onClick={
                    userRole === "superadmin"
                      ? handleAdminUpdate
                      : userRole === "admin"
                      ? handleAdminUpdate
                      : handleUpdate
                  }
                  className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
                  disabled={isLoading || fetchingUserData}
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setShowUpdateModal(false);
                    setError("");
                    setFormData({
                      username: "",
                      email: "",
                      password: "",
                      gender: "",
                      phone: "",
                    });
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 ml-2"
                  disabled={isLoading || fetchingUserData}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[200]">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Confirm Delete
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete your account? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={confirmDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  disabled={isLoading}
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showStatusModal && ["pending_admin", "admin", "rejected_admin"].includes(userRole) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[200]">
            <div
              ref={statusModalRef}
              className="bg-white p-6 rounded-lg w-full max-w-md"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Application Status
              </h2>
              {statusError && (
                <p className="text-red-600 mb-4">{statusError}</p>
              )}
              {statusLoading ? (
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
                  <p className="mt-2 text-gray-600">Loading...</p>
                </div>
              ) : applicationData ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Role</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">
                      {applicationData.role.replace("_", " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <p
                      className={`text-lg font-semibold capitalize ${
                        applicationData.status === "approved"
                          ? "text-green-600"
                          : applicationData.status === "rejected"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {applicationData.status}
                    </p>
                  </div>

                  <div className="bg-gray-100 p-3 rounded-lg">
                    <p
                      className={`text-sm ${
                        applicationData.status === "approved"
                          ? "text-green-700"
                          : applicationData.status === "rejected"
                            ? "text-red-700"
                            : "text-yellow-700"
                      }`}
                    >
                      {getStatusMessage(applicationData.status)}
                    </p>
                  </div>

                  {applicationData.status === "rejected" && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-600">
                        Rejection Reason:
                      </p>
                      <p className="text-md text-red-700 bg-red-50 p-2 rounded">
                        {applicationData.rejectionReason || "No specific reason provided."}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => setShowStatusModal(false)}
                      className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">No application data found.</p>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;