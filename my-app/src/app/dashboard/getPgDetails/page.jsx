'use client';

import SuperAdminLayout from '@/app/components/superAdminDashboardLayout';
import { useState, useEffect, useRef, useCallback } from 'react';

export default function PGDetailsTable() {
  const [pgDetails, setPGDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const lastPGElementRef = useCallback(
    (node) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    const fetchPGDetails = async (pageNum) => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/pg-details?page=${pageNum}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch PG details');
        }

        const data = await response.json();
        console.log(data);
        setPGDetails((prevDetails) => [...prevDetails, ...data.data]); // Append new data
        setHasMore(data.hasMore || false); // Update hasMore based on API response
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (hasMore) {
      fetchPGDetails(page);
    }
  }, [page]);

  if (error) return <div className="text-center py-10 text-red-500 text-lg">{error}</div>;

  return (
    <SuperAdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pgDetails.map((pg, index) => (
            <div
              key={`${pg.id}-${index}`} // Use unique key, assuming pg.id exists
              ref={index === pgDetails.length - 1 ? lastPGElementRef : null} // Attach ref to last element
              className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl animate-fade-in"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4 truncate">{pg.name}</h2>
              <div className="space-y-3 text-gray-600">
                <p className="flex items-center">
                  <span className="font-semibold text-gray-700 w-32">City:</span>
                  <span>{pg.address.city}</span>
                </p>
                <p className="flex items-center">
                  <span className="font-semibold text-gray-700 w-32">Gender:</span>
                  <span>{pg.genderAllowed}</span>
                </p>
                <p className="flex items-center">
                  <span className="font-semibold text-gray-700 w-32">Rent:</span>
                  <span className="text-green-600">₹{pg.rent}</span>
                </p>
                <p className="flex items-center">
                  <span className="font-semibold text-gray-700 w-32">Sharing:</span>
                  <span>{pg.sharing}</span>
                </p>
                <p className="flex items-center">
                  <span className="font-semibold text-gray-700 w-32">Availability:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      pg.availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {pg.availability ? 'Yes' : 'No'}
                  </span>
                </p>
                <p className="flex items-center">
                  <span className="font-semibold text-gray-700 w-32">Created At:</span>
                  <span>{new Date(pg.createdAt).toLocaleDateString()}</span>
                </p>
                <p className="flex items-center">
                  <span className="font-semibold text-gray-700 w-32">Updated At:</span>
                  <span>{new Date(pg.updatedAt).toLocaleDateString()}</span>
                </p>
                <p className="flex items-center">
                  <span className="font-semibold text-gray-700 w-32">Other Charges:</span>
                  <span>
                    Elec: ₹{pg.charges.electricity}, Maint: ₹{pg.charges.maintenance}, Dep: ₹
                    {pg.charges.deposit}
                  </span>
                </p>
                <p className="flex items-center">
                  <span className="font-semibold text-gray-700 w-32">Admin Name:</span>
                  <span>{pg.admin.name}</span>
                </p>
                <p className="flex items-center">
                  <span className="font-semibold text-gray-700 w-32">Admin Email:</span>
                  <span className="text-blue-600">{pg.admin.email}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
        {loading && <div className="text-center py-10 text-gray-600 text-lg">Loading more...</div>}
        {!hasMore && pgDetails.length > 0 && (
          <div className="text-center py-10 text-gray-600 text-lg">No more PGs to load</div>
        )}
      </div>
    </SuperAdminLayout>
  );
}