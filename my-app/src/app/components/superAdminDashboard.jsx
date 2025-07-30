"use client";
import SuperAdminLayout from "./superAdminDashboardLayout";
import Link from "next/link";

const SuperAdminDashboard = () => {
  return (
    <SuperAdminLayout>
            <div>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Welcome, Admin!</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-lg font-bold text-gray-700">
              <Link href="/dashboard/pendingPgOwners" className="text-blue-600 hover:underline">
                Pending Pg Owners
              </Link>
            </h3>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-lg font-bold text-gray-700">
              <Link href="/dashboard/getPgOwnersDetails" className="text-blue-600 hover:underline">
                PG Owner List
              </Link>
            </h3>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
          <Link href="/dashboard/showComplaints" className="text-blue-600 hover:underline">
            <h3 className="text-lg font-bold text-gray-700">Manage User Complaints</h3>
            </Link>
            <p className="text-sm text-gray-500 mt-1">View and confirm user Complaints.</p>
           
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-lg font-bold text-gray-700">
              <Link href="/dashboard/getPgDetails" className="text-blue-600 hover:underline">
                All PG Details
              </Link>
            </h3>
          </div>

          
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;
