"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { FaLocationDot, FaPhone } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Contact({ icon: Icon, description, content }) {
  return (
    <div className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-md">
      {Icon && (
        <div className="text-teal-600 text-3xl">
          <Icon />
        </div>
      )}
      <div>
        <h2 className="text-xl font-semibold text-gray-800">{description}</h2>
        <p className="text-gray-600">{content}</p>
      </div>
    </div>
  );
}

function ContactDetail() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneno: "",
    enquirytype: "",
    message: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || "",
      }));
    }
  }, [session]);

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
    setLoading(true);

    const isLoggedIn = !!session;

    if (!isLoggedIn) {
      toast.error("Please sign in to register a complaint!", {
        position: "top-right",
        autoClose: 3000,
      });
      setLoading(false);
      router.push("/signin");
      return;
    }

    try {
      const userId=session.user.id
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/enquiryDetail/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Name: formData.name,
          Email: formData.email,
          PhoneNumber: formData.phoneno,
          EnquiryType: formData.enquirytype,
          Message: formData.message,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Details not added");
      }

      setSuccess("Your enquiry was submitted successfully!");
      setFormData((prev) => ({
        ...prev,
        phoneno: "",
        enquirytype: "",
        message: "",
      }));
      toast.success("Enquiry submitted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      setError(error.message || "An error occurred. Please try again.");
      toast.error(error.message || "An error occurred!", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <p className="text-center mt-8">Loading...</p>;
  }

  return (
    <section className="bg-[#E4FDE1] py-12 px-4 md:px-8">
      <ToastContainer />
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Contact Details */}
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Get in Touch</h1>
          <Contact
            icon={FaLocationDot}
            description="Location"
            content="9-20, Bethel Nagar St, Industrial Estate, Perungudi, Chennai, Tamil Nadu 600096, India"
          />
          <Contact icon={FaPhone} description="Phone" content="+91-8939654691" />
          <Contact icon={MdOutlineEmail} description="Email" content="info@bookmypg.co.in" />
        </div>

        {/* Contact Form */}
        <div className="flex-1">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                readOnly
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                readOnly
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label htmlFor="phoneno" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneno"
                id="phoneno"
                value={formData.phoneno}
                onChange={handleChange}
                pattern="[6-9][0-9]{9}"
                placeholder="Enter your phone number"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="enquirytype" className="block text-sm font-medium text-gray-700">
                Enquiry Type
              </label>
              <select
                name="enquirytype"
                id="enquirytype"
                value={formData.enquirytype}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">--select--</option>
                <option value="PgBooking">Pg Booking</option>
                <option value="CustomerService">Customer Service</option>
                <option value="Complaints">Complaints</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                name="message"
                id="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                placeholder="Enter your message"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500"
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>

              {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
              {success && <div className="mt-2 text-sm text-green-600">{success}</div>}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ContactDetail;
