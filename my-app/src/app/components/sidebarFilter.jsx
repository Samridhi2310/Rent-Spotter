// "use client";
// import React from "react";

// export default function FilterPanel({
//   sharingOptions,
//   genderOptions,
//   rentOptions,
//   selectedSharing,
//   selectedGender,
//   selectedRent,
//   handleSharingChange,
//   handleGenderChange,
//   handleRentChange,
//   showFilter,
//   applyFilters, // ⭐ NEW: function to call when clicking "Apply Filters"
// }) {
//   return (
//     <div
//       className={`md:w-1/4 w-full bg-white p-4 rounded-xl shadow-md border border-teal-300 h-fit
//         ${showFilter ? "block" : "hidden"} md:block`}
//     >
//       {/* Sharing */}
//       <h3 className="text-lg font-semibold mb-4 text-teal-600">Sharing</h3>
//       <div className="space-y-3">
//         {sharingOptions.map((opt) => (
//           <label key={opt} className="flex items-center gap-2 cursor-pointer">
//             <input
//               type="checkbox"
//               checked={selectedSharing === opt}
//               onChange={() => handleSharingChange(opt)}
//               className="text-teal-600"
//             />
//             <span>{opt}</span>
//           </label>
//         ))}
//       </div>

//       {/* Gender */}
//       <h3 className="text-lg font-semibold mt-6 mb-4 text-teal-600">Gender</h3>
//       <div className="space-y-3">
//         {genderOptions.map((opt) => (
//           <label key={opt} className="flex items-center gap-2 cursor-pointer">
//             <input
//               type="checkbox"
//               checked={selectedGender === opt}
//               onChange={() => handleGenderChange(opt)}
//               className="text-teal-600"
//             />
//             <span>{opt}</span>
//           </label>
//         ))}
//       </div>

//       {/* Rent */}
//       <h3 className="text-lg font-semibold mt-6 mb-4 text-teal-600">Rent</h3>
//       <div className="space-y-3">
//         {rentOptions.map((opt) => (
//           <label key={opt} className="flex items-center gap-2 cursor-pointer">
//             <input
//               type="checkbox"
//               checked={selectedRent === opt}
//               onChange={() => handleRentChange(opt)}
//               className="text-teal-600"
//             />
//             <span>{opt}</span>
//           </label>
//         ))}
//       </div>

//       {/* ⭐ APPLY FILTER BUTTON — visible on laptop & mobile */}
//       <button
//         onClick={applyFilters}
//         className="mt-6 w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-all duration-200 font-semibold shadow-md"
//       >
//         Apply Filters
//       </button>
//     </div>
//   );
// }


// components/FilterPanel.js
"use client";

export default function FilterPanel({
  sharingOptions,
  genderOptions,
  rentOptions,
  selectedSharing,
  selectedGender,
  selectedRent,
  handleSharingChange,
  handleGenderChange,
  handleRentChange,
  applyFilters,
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-teal-200 p-6 sticky top-24">
      <h2 className="text-2xl font-bold text-teal-700 mb-6">Filters</h2>

      {/* Sharing */}
      <div className="mb-6">
        <h3 className="font-semibold text-teal-600 mb-3">Sharing</h3>
        <div className="space-y-2">
          {sharingOptions.map((opt) => (
            <label key={opt} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedSharing === opt}
                onChange={() => handleSharingChange(selectedSharing === opt ? '' : opt)}
                className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
              />
              <span className="text-gray-700">{opt}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Gender */}
      <div className="mb-6">
        <h3 className="font-semibold text-teal-600 mb-3">Gender</h3>
        <div className="space-y-2">
          {genderOptions.map((opt) => (
            <label key={opt} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedGender === opt}
                onChange={() => handleGenderChange(selectedGender === opt ? '' : opt)}
                className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
              />
              <span className="text-gray-700">{opt}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rent */}
      <div className="mb-8">
        <h3 className="font-semibold text-teal-600 mb-3">Rent Range</h3>
        <div className="space-y-2">
          {rentOptions.map((opt) => (
            <label key={opt} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedRent === opt}
                onChange={() => handleRentChange(selectedRent === opt ? '' : opt)}
                className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
              />
              <span className="text-gray-700">₹{opt}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={applyFilters}
        className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition shadow-md"
      >
        Apply Filters
      </button>
    </div>
  );
}
