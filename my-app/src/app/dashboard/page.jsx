"use client";
import UserInfo from "../userInfo";
import AdminDashboard from "../adminDashboard";
import SuperAdminDashboard from "../components/superAdminDashboard";

import FetchPgDetails from "../components/fetchPgDetails";

export default function Dashboard() {
  return (
    <div className="">
      <div className="bg-white shadow-2xl rounded-xl text-center w-full ">
        <UserInfo>
          {(session) => (
            <div>
              <div className="flex justify-between items-center gap-4 ">
                {session?.user?.image && (
                  <img
                    src={session.user.image}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                )}
              </div>

              {/* ✅ Corrected role-based rendering */}
              {session?.user?.role === "superadmin" ? (
                <SuperAdminDashboard />
              ) : session?.user?.role === "admin" ? (
                <AdminDashboard />
              ) : (
                <FetchPgDetails />
              )}
            </div>
          )}
        </UserInfo>
      </div>
    </div>
  );
}
