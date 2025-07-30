// pages/dashboard/admin.jsx
import AdminLayout from "./adminDashboardLayout";
import Link from "next/link";

const AdminDashboard = () => {
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
            <h3 className="text-lg font-bold text-gray-700">
              <Link href="/dashboard/showPgDetails" className="text-blue-600 hover:underline">
                Show PG Details
              </Link>
            </h3>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
          <Link href="/dashboard/manageBookings" className="text-blue-600 hover:underline">
            <h3 className="text-lg font-bold text-gray-700">Manage Bookings</h3>
            </Link>
            <p className="text-sm text-gray-500 mt-1">View and confirm user bookings.</p>
           
          </div>

          
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

