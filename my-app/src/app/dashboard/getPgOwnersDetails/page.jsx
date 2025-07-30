"use client";
import SuperAdminLayout from '@/app/components/superAdminDashboardLayout';
import { useEffect, useState } from 'react';

export default function AdminDetails() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getAllAdminDetails`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setAdmins(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching admin details:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <SuperAdminLayout>
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Details</h1>
      <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-3 px-6 text-left">Username</th>
              <th className="py-3 px-6 text-left">Role</th>
              <th className="py-3 px-6 text-left">Phone</th>
              <th className="py-3 px-6 text-left">Application Status</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin._id} className="border-b">
                <td className="py-3 px-6">{admin.username}</td>
                <td className="py-3 px-6 capitalize">{admin.role}</td>
                <td className="py-3 px-6">{admin.phone}</td>
                <td className="py-3 px-6 capitalize">{admin.applicationStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </SuperAdminLayout>
  );
}
