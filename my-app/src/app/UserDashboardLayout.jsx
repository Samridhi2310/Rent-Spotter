// components/layouts/UserLayout.jsx
import React from "react";
import { signOut } from "next-auth/react";

const UserLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <nav className="bg-emerald-500 text-white w-64 p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
          <ul className="flex text-2xl flex-col gap-y-6">
            <li className="hover:text-gray-300 cursor-pointer">Dashboard</li>
            <li className="hover:text-gray-300 cursor-pointer">Manage PGs</li>
            <li className="hover:text-gray-300 cursor-pointer">Bookings</li>
            <li className="hover:text-gray-300 cursor-pointer">Complaints</li>
          </ul>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/signin" })}
          className="hover:text-black text-2xl"
        >
          Sign Out
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-100">{children}</main>
    </div>
  );
};

export default UserLayout;
