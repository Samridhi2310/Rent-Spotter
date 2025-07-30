// pages/dashboard/admin.jsx
import AdminLayout from "./UserDashboardLayout";
import Link from "next/link";

const userDashboard = () => {
  return (
    <AdminLayout>
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Welcome, Admin!</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-lg font-bold text-gray-700">
              <Link href="/dashboard/addPgDetails" className="text-blue-600 hover:underline">
                Upload PG Details
              </Link>
            </h3>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-lg font-bold text-gray-700">Manage Bookings</h3>
            <p className="text-sm text-gray-500 mt-1">View and confirm user bookings.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-lg font-bold text-gray-700">User Management</h3>
            <p className="text-sm text-gray-500 mt-1">View, update, or delete users.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow col-span-1 md:col-span-3 hover:shadow-md transition">
            <h3 className="text-lg font-bold text-gray-700">Complaints</h3>
            <p className="text-sm text-gray-500 mt-1">Check registered complaints.</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default userDashboard;
