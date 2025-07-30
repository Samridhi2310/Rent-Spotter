"use client";

import Link from "next/link";

const SuperAdminLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col sm:flex-row">
      {/* Navbar for mobile, Sidebar for larger screens */}
      <nav className="bg-emerald-500 text-white">
        <div className="p-4">
          <h1 className="mb-10 text-3xl font-bold sm:text-4xl">Admin Panel</h1>
          <div className="flex   overflow-x-auto hide-scrollbar sm:flex-col sm:space-y-2">
            <Link
              href="/dashboard"
              className="block whitespace-nowrap rounded-md px-4 py-2 text-lg hover:bg-emerald-600 sm:text-3xl sm:whitespace-normal"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/pendingPgOwners"
              className="block whitespace-nowrap rounded-md px-4 py-2 text-lg hover:bg-emerald-600 sm:text-2xl sm:whitespace-normal"
            >
              Pending PG Owners
            </Link>
            <Link
              href="/dashboard/getPgOwnersDetails"
              className="block whitespace-nowrap rounded-md px-4 py-2 text-lg hover:bg-emerald-600 sm:text-2xl sm:whitespace-normal"
            >
              PG Owner List
            </Link>
            <Link
              href="/dashboard/showComplaints"
              className="block whitespace-nowrap rounded-md px-4 py-2 text-lg hover:bg-emerald-600 sm:text-2xl sm:whitespace-normal"
            >
             User Complaints
            </Link>
            <Link
              href="/dashboard/getPgDetails"
              className="block whitespace-nowrap rounded-md px-4 py-2 text-lg hover:bg-emerald-600 sm:text-2xl sm:whitespace-normal"
            >
              All PG Details
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-100 p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
};

export default SuperAdminLayout;