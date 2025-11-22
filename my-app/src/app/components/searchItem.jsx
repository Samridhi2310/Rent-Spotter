"use client";

import { IoSearchCircle } from "react-icons/io5";

export default function SearchBar({ city, setCity, handleSubmit }) {
  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-3 bg-white p-3 rounded-xl mx-auto mt-8 shadow-md border border-teal-500 w-fit"
    >
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter city to find PGs"
        className="bg-transparent border border-teal-300 px-4 py-2 rounded-md w-72"
      />
      <button className="bg-teal-600 text-white p-2 rounded-md">
        <IoSearchCircle className="text-3xl" />
      </button>
    </form>
  );
}
