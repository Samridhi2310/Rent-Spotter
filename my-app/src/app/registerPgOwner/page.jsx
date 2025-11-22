"use client"
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function RegisterPgOwner() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    gender: '',
    phone: '',
    propertyAddress: '',
    registrationNumber: '',
  });

  const [documents, setDocuments] = useState({
    noc: null,
    tradeLicense: null,
    policeVerification: null,
    gstRegistration: null,
    propertyInsurance: null,
    healthSanitationCertificate: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setDocuments((prev) => ({ ...prev, [name]: files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });
    Object.entries(documents).forEach(([key, file]) => {
      if (file) {
        data.append(key, file);
      }
    });

    try {
      const response = await fetch(`/api/proxy/register-pg-owner`, {
        method: 'POST',
        body: data,
      });

      const result = await response.json();
      if (response.ok) {
        toast.success('Registration successful!');
      } else {
        toast.error(`Registration failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error during registration:', error);
      toast.error('An error occurred during registration.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            style: {
              background: "#E6FFFA",
              color: "#2B6CB0",
              border: "1px solid #2B6CB0",
            },
          },
          error: {
            style: {
              background: "#FFF5F5",
              color: "#C53030",
              border: "1px solid #C53030",
            },
          },
        }}
      />
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="bg-white shadow-lg rounded-xl p-8 w-full max-w-2xl space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-teal-600">PG Owner Registration</h2>

        {[
          { label: 'Username', name: 'username', type: 'text' },
          { label: 'Email', name: 'email', type: 'email' },
          { label: 'Password', name: 'password', type: 'password' },
          { label: 'Phone', name: 'phone', type: 'tel' },
          { label: 'Property Address', name: 'propertyAddress', type: 'text' },
          { label: 'Registration Number', name: 'registrationNumber', type: 'text' },
        ].map(({ label, name, type }) => (
          <div key={name} className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">{label}:</label>
            <input
              type={type}
              name={name}
              value={formData[name]}
              onChange={handleInputChange}
              required
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        ))}

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Gender:</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            required
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        {[
          { label: 'NOC', name: 'noc' },
          { label: 'Trade License', name: 'tradeLicense' },
          { label: 'Police Verification', name: 'policeVerification' },
          { label: 'GST Registration', name: 'gstRegistration' },
          { label: 'Property Insurance', name: 'propertyInsurance' },
          { label: 'Health Sanitation Certificate', name: 'healthSanitationCertificate' },
        ].map(({ label, name }) => (
          <div key={name} className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">{label}:</label>
            <input
              type="file"
              name={name}
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              required
              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
            />
          </div>
        ))}

        <button
          type="submit"
          className="w-full bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 transition-colors duration-200"
        >
          Register
        </button>
      </form>
    </div>
  );
}