const pgSchema = require("../model/pgDetails");
const upload = require("../middleware/multer"); // Import Multer middleware
const pgDetailModel = require("../model/pgDetails");

// Route to show PG details
exports.ShowPgDetails = async (req, res) => {
  const { city, sharing, rent, gender } = req.body;

  try {
    // Validate city input
    if (!city || typeof city !== "string") {
      return res
        .status(400)
        .json({ message: "City Name is required and must be a string" });
    }

    // Build the query object
    let query = { "address.city": city };

    // Add the sharing filter, if applicable
    if (sharing && sharing !== "All") {
      query.sharing = sharing;
    }

    // Handle the rent filter (single value or range)
    if (rent) {
      const rentRange = rent.split("-");

      if (rentRange.length > 1) {
        query.rent = { $gte: parseInt(rentRange[0]), $lte: parseInt(rentRange[1]) };
      } else {
        const rentValue = parseInt(rent);
        if (!isNaN(rentValue)) {
          query.rent = { $gte: rentValue };
        }
      }
    }

    // Handle the gender filter
    if (gender && gender !== "All") {
      query.genderAllowed = gender;
    }

    console.log("Query being used:", query);

    // Fetch the data from the database
    const data = await pgSchema.find(query);

    if (data.length === 0) {
      return res
        .status(404)
        .json({ message: "No PG data found for the specified filters" });
    }

    res.status(200).json({ message: "Data Exist", data });
  } catch (err) {
    console.error("Error fetching PG details:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// Route to delete PG detail
exports.deletedPgDetail = async (req, res) => {
  try {
    const pgDetailId = req.params.pgDetailId;
    console.log(pgDetailId, "gh");
    const deletedPgDetail = await pgSchema.findByIdAndDelete(pgDetailId);

    if (!deletedPgDetail) {
      return res.status(404).json({ message: "PG detail not found" });
    }

    res.status(200).json({ message: "PG detail deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};



// Route to get ALL PG details (Public)
// backend/controllers/pgController.js or wherever your routes are

exports.getAllPgDetails = async (req, res) => {
  try {
    const { city, sharing, rent, gender, page = 1, limit = 9 } = req.query;

    let query = { availability: true }; // Only show available PGs

    // City filter
    if (city && city.trim() !== "") {
      query["address.city"] = { $regex: new RegExp(city, 'i') }; // Case-insensitive
    }

    // Sharing filter
    if (sharing && sharing !== "All" && sharing !== "") {
      query.sharing = sharing;
    }

    // Rent filter
    if (rent && rent.trim() !== "") {
      const rentRange = rent.split("-");
      if (rentRange.length > 1) {
        query.rent = {
          $gte: parseInt(rentRange[0]),
          $lte: parseInt(rentRange[1]),
        };
      } else if (rent.startsWith('<')) {
        query.rent = { $lt: parseInt(rent.slice(1)) };
      } else if (rent.includes('+')) {
        query.rent = { $gte: parseInt(rent.replace('+', '')) };
      } else {
        const rentValue = parseInt(rent);
        if (!isNaN(rentValue)) query.rent = { $gte: rentValue };
      }
    }

    // Gender filter
    if (gender && gender !== "All" && gender !== "") {
      query.genderAllowed = gender;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Fetch paginated data + total count in parallel
    const [data, total] = await Promise.all([
      pgSchema.find(query).skip(skip).limit(limitNum).sort({ createdAt: -1 }),
      pgSchema.countDocuments(query),
    ]);

    const hasMore = skip + data.length < total;

    res.status(200).json({
      success: true,
      count: data.length,
      total,
      hasMore,
      page: pageNum,
      data,
    });

  } catch (error) {
    console.error("Error in getAllPgDetails:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};





// Route to update PG details
exports.updatedPgDetail = async (req, res) => {
  try {
    const pgDetailId = req.params.pgDetailId;

    // Debug: Log req.body and req.files
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);

    // Fetch existing PG to compare changes
    const existingPg = await pgSchema.findById(pgDetailId);
    if (!existingPg) {
      return res.status(404).json({ message: "PG detail not found" });
    }

    // Initialize update object
    const updateData = {};

    // Helper function to check if a value has changed
    const hasChanged = (newValue, oldValue) => {
      if (newValue === undefined || newValue === null) return false;
      if (Array.isArray(newValue) && Array.isArray(oldValue)) {
        return JSON.stringify(newValue) !== JSON.stringify(oldValue);
      }
      return newValue !== oldValue && newValue.toString().trim() !== "";
    };

    // Parse and compare scalar fields
    const scalarFields = [
      "sharing",
      "name",
      "description",
      "genderAllowed",
      "rent",
      "availability",
    ];
    scalarFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        const newValue =
          field === "rent"
            ? parseInt(req.body[field])
            : field === "availability"
            ? req.body[field] === "true" || req.body[field] === true
            : req.body[field];
        if (hasChanged(newValue, existingPg[field])) {
          updateData[field] = newValue;
        }
      }
    });

    // Parse and compare address fields
    let address;
    if (req.body.address) {
      // Case 1: address sent as JSON string
      try {
        address = typeof req.body.address === "string"
          ? JSON.parse(req.body.address)
          : req.body.address;
      } catch (err) {
        return res.status(400).json({ message: "Invalid address format" });
      }
    } else {
      // Case 2: access req.body["address[street]"] directly
      address = {
        street: req.body["address[street]"] || "",
        city: req.body["address[city]"] || "",
        state: req.body["address[state]"] || "",
        pincode: req.body["address[pincode]"] || "",
        landmark: req.body["address[landmark]"] || "",
      };
    }

    // Validate required address fields
    const requiredAddressFields = ["street", "city", "state", "pincode"];
    const missingFields = requiredAddressFields.filter(
      (field) => !address[field] || address[field].trim() === ""
    );
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required address fields: ${missingFields.join(", ")}`,
      });
    }

    // Compare address fields
    const addressChanged = requiredAddressFields.some(
      (field) => hasChanged(address[field], existingPg.address[field])
    ) || hasChanged(address.landmark, existingPg.address.landmark);
    if (addressChanged) {
      updateData.address = address;
    }

    // Parse and compare charges fields
    const charges = {
      electricity: req.body["charges[electricity]"]
        ? parseInt(req.body["charges[electricity]"])
        : undefined,
      maintenance: req.body["charges[maintenance]"]
        ? parseInt(req.body["charges[maintenance]"])
        : undefined,
      deposit: req.body["charges[deposit]"]
        ? parseInt(req.body["charges[deposit]"])
        : undefined,
    };
    const chargesChanged = Object.keys(charges).some(
      (key) => hasChanged(charges[key], existingPg.charges[key])
    );
    if (chargesChanged) {
      updateData.charges = { ...existingPg.charges, ...charges };
    }

    // Parse and compare amenities and rules arrays
    const amenities = req.body["amenities[]"]
      ? Array.isArray(req.body["amenities[]"])
        ? req.body["amenities[]"]
        : req.body["amenities[]"].split(",").map((item) => item.trim())
      : [];
    if (hasChanged(amenities, existingPg.amenities)) {
      updateData.amenities = amenities;
    }

    const rules = req.body["rules[]"]
      ? Array.isArray(req.body["rules[]"])
        ? req.body["rules[]"]
        : req.body["rules[]"].split(",").map((item) => item.trim())
      : [];
    if (hasChanged(rules, existingPg.rules)) {
      updateData.rules = rules;
    }

    // Handle uploaded images
    let images;
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => file.path); // Cloudinary URL
      updateData.images = [...(existingPg.images || []), ...images];
    }

    // Debug: Log fields to be updated
    console.log("Fields to update:", updateData);

    // If no fields changed, return early
    if (Object.keys(updateData).length === 0) {
      return res.status(200).json({
        message: "No changes detected",
        data: existingPg,
      });
    }

    // Update PG in the database
    const updatedPgDetail = await pgSchema.findByIdAndUpdate(
      pgDetailId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedPgDetail) {
      return res.status(404).json({ message: "PG detail not found" });
    }

    res.status(200).json({
      message: "PG detail updated successfully",
      data: updatedPgDetail,
    });
  } catch (err) {
    console.error("Error updating PG detail:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// Route to get PG details for an admin with pagination
exports.getMyPgDetails = async (req, res) => {
  try {
    const adminId = req.params.adminId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch paginated PGs
    const pgDetails = await pgSchema
      .find({ adminId: adminId })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await pgSchema.countDocuments({ adminId: adminId });

    if (pgDetails.length === 0) {
      return res
        .status(404)
        .json({ message: "No PG details found for this admin" });
    }

    res.status(200).json({
      message: "PG details found",
      data: pgDetails,
      total,
    });
  } catch (err) {
    console.error("Error fetching PG details:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};
exports.getPGDetailsForSuperadmin = async (req, res) => {
  try {
    const pgDetails = await pgDetailModel
      .find()
      .select('name address.city  genderAllowed rent sharing availability createdAt updatedAt  charges')
      .populate('adminId', 'username email')
      .lean();

    // Transform the response to exclude adminId and include admin details
    const formattedDetails = pgDetails.map(pg => ({
      name: pg.name,
      address: {
        city: pg.address.city,
        state: pg.address.state,
        pincode: pg.address.pincode,
      },
      genderAllowed: pg.genderAllowed,
      rent: pg.rent,
      sharing: pg.sharing,
      availability: pg.availability,
      createdAt: pg.createdAt,
      updatedAt: pg.updatedAt,
      amenities: pg.amenities,
      charges: pg.charges,
      admin: {
        name: pg.adminId.username,
        email: pg.adminId.email,
      },
    }));

    res.status(200).json({
      success: true,
      data: formattedDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};