"use client";
import Link from 'next/link';
import React, { useState } from 'react';

function SignUp() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    gender: "",
    phone: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Details not added");
      }

      setSuccess(data.message);
      setFormData({
        username: "",
        email: "",
        password: "",
        gender: "",
        phone: ""
      });
    } catch (error) {
      setError(error.message || "An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen p-3 flex items-center justify-center bg-[#E4FDE1] px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg space-y-6">
        <h2 className="text-3xl font-bold text-center text-teal-500">Create an Account</h2>

        {/* Input fields */}
        <div>
          <label htmlFor='username' className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type='text'
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder='Enter your username'
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor='email' className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type='email'
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder='Enter your email'
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor='password' className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder='Enter your password'
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input type="radio" name="gender" value="male" checked={formData.gender === "male"} onChange={handleChange} className="text-blue-600 focus:ring-blue-500" />
              <span className="ml-2 text-gray-700">Male</span>
            </label>
            <label className="inline-flex items-center">
              <input type="radio" name="gender" value="female" checked={formData.gender === "female"} onChange={handleChange} className="text-blue-600 focus:ring-blue-500" />
              <span className="ml-2 text-gray-700">Female</span>
            </label>
            <label className="inline-flex items-center">
              <input type="radio" name="gender" value="other" checked={formData.gender === "other"} onChange={handleChange} className="text-blue-600 focus:ring-blue-500" />
              <span className="ml-2 text-gray-700">Other</span>
            </label>
          </div>
        </div>

        <div>
          <label htmlFor='phone' className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type='tel'
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder='Enter your phone number'
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button type="submit" className="w-full hover:bg-teal-400 text-white py-2 px-4 rounded-md bg-teal-500 transition duration-200">
          Sign Up
        </button>

        {error && (
          <p className="text-red-600 text-sm text-center">{error}</p>
        )}
        {success && (
          <p className="text-green-600 text-sm text-center">{success}</p>
        )}

        {/* Login Link - Centered */}
        <div className="flex justify-center mt-4">
          <Link href="/signin" className="text-teal-600 hover:underline font-medium">
            Already have an account? Login
          </Link>
        </div>
      </form>
    </div>
  );
}

export default SignUp;
