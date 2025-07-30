"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import AdminLayout from "@/app/adminDashboardLayout";

export default function AddPgPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    sharing: "Single",
    name: "",
    description: "",
    genderAllowed: "Boys",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
    },
    rent: "",
    amenities: [],
    charges: {
      electricity: "",
      maintenance: "",
      deposit: "",
    },
    rules: [],
    availability: true,
  });

  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [section, key] = name.split(".");
      setForm((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value,
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleArrayChange = (e, field) => {
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value.split(","),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("sharing", form.sharing);
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("genderAllowed", form.genderAllowed);
    formData.append("rent", form.rent);
    formData.append("availability", form.availability);

    Object.entries(form.address).forEach(([key, value]) => {
      formData.append(`address[${key}]`, value);
    });

    Object.entries(form.charges).forEach(([key, value]) => {
      formData.append(`charges[${key}]`, value);
    });

    form.amenities.forEach((amenity) =>
      formData.append("amenities[]", amenity)
    );
    form.rules.forEach((rule) => formData.append("rules[]", rule));
    Array.from(selectedFiles).forEach((file) => {
      formData.append("images", file);
    });

    const adminId = session?.user?.id;
    if (!adminId) {
      toast.error("Admin not authenticated");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/addPgDetail/${adminId}`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "PG added successfully");
        
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (err) {
      toast.error("Server error occurred");
    }
  };

  return (
    <AdminLayout>
    <div className="max-w-2xl mx-auto p-4">
      <Toaster position="top-right" />
      <h2 className="text-xl font-semibold mb-4">Add PG Details</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="PG Name"
          value={form.name}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <select
          name="genderAllowed"
          value={form.genderAllowed}
          onChange={handleChange}
          className="border p-2 w-full"
        >
          <option value="Boys">Boys</option>
          <option value="Girls">Girls</option>
        </select>

        <select
          name="sharing"
          value={form.sharing}
          onChange={handleChange}
          className="border p-2 w-full"
        >
          <option value="Single">Single</option>
          <option value="Double">Double</option>
          <option value="Triple">Triple</option>
          <option value="Quad">Quad</option>
          <option value="Bunk Bed">Bunk Bed</option>
        </select>

        <div>
          <h4 className="font-medium">Address</h4>
          {["street", "city", "state", "pincode", "landmark"].map((key) => (
            <input
              key={key}
              name={`address.${key}`}
              placeholder={key}
              value={form.address[key]}
              onChange={handleChange}
              className="border p-2 w-full mb-1"
            />
          ))}
        </div>

        <input
          type="number"
          name="rent"
          placeholder="Rent"
          value={form.rent}
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <input
          name="amenities"
          placeholder="Amenities (comma separated)"
          value={form.amenities.join(",")}
          onChange={(e) => handleArrayChange(e, "amenities")}
          className="border p-2 w-full"
        />

        <div>
          <h4 className="font-medium">Charges</h4>
          {["electricity", "maintenance", "deposit"].map((key) => (
            <input
              key={key}
              type="number"
              name={`charges.${key}`}
              placeholder={key}
              value={form.charges[key]}
              onChange={handleChange}
              className="border p-2 w-full mb-1"
            />
          ))}
        </div>

        <input
          name="rules"
          placeholder="Rules (comma separated)"
          value={form.rules.join(",")}
          onChange={(e) => handleArrayChange(e, "rules")}
          className="border p-2 w-full"
        />

        <input
          type="file"
          name="images"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="border p-2 w-full"
        />

        <label>
          <input
            type="checkbox"
            name="availability"
            checked={form.availability}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                availability: e.target.checked,
              }))
            }
          />
          Available
        </label>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
      </form>
    </div>
    </AdminLayout>
  );
}

