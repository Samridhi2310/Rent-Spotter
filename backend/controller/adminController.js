const pgDetailSchema = require('../model/pgDetails');
const UserSchema = require("../model/user");
const bcrypt = require("bcryptjs");
exports.AddPgDetails = async (req, res) => {
  try {
    const {
      sharing,
      name,
      description,
      genderAllowed,
      rent,
      availability,
    } = req.body;

    const address = req.body.address?.street
      ? req.body.address
      : {
          street: req.body['address[street]'],
          city: req.body['address[city]'],
          state: req.body['address[state]'],
          pincode: req.body['address[pincode]'],
          landmark: req.body['address[landmark]'],
        };

    const charges = req.body.charges?.electricity
      ? req.body.charges
      : {
          electricity: req.body['charges[electricity]'],
          maintenance: req.body['charges[maintenance]'],
          deposit: req.body['charges[deposit]'],
        };

    const amenities = Array.isArray(req.body.amenities)
      ? req.body.amenities
      : req.body.amenities
      ? [req.body.amenities]
      : [];

    const rules = Array.isArray(req.body.rules)
      ? req.body.rules
      : req.body.rules
      ? [req.body.rules]
      : [];

    const images = req.files.map(file => file.path);
    const adminId = req.params.adminId;

    const data = await pgDetailSchema.create({
      sharing,
      name,
      description,
      genderAllowed,
      address,
      rent,
      amenities,
      charges,
      rules,
      availability,
      images,
      adminId,
    });

    res.status(200).json({ message: 'PG details added successfully', data });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};

exports.GetPgs = async (req, res) => {
  try {
    const adminId = req.query.adminId;
    const pgs = await pgDetailSchema.find({ adminId, isActive: true });
    res.status(200).json(pgs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.UpdatePgDetails = async (req, res) => {
  try {
    const { pgId } = req.params.pgId;
    const adminId = req.user.id; // From verifyRole middleware
    const {
      sharing,
      name,
      description,
      genderAllowed,
      rent,
      availability,
      amenities,
      rules,
    } = req.body;

    // Verify PG exists
    const pg = await pgDetailSchema.findById(pgId);
    if (!pg) {
      return res.status(404).json({ message: 'PG not found' });
    }

    // Check if requester is the admin who created the PG or has admin role
    if (pg.adminId !== adminId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You can only update your own PGs or need admin privileges' });
    }

    // Handle address
    const address = req.body.address?.street
      ? req.body.address
      : req.body['address[street]']
      ? {
          street: req.body['address[street]'],
          city: req.body['address[city]'],
          state: req.body['address[state]'],
          pincode: req.body['address[pincode]'],
          landmark: req.body['address[landmark]'],
        }
      : undefined;

    // Handle charges
    const charges = req.body.charges?.electricity
      ? req.body.charges
      : req.body['charges[electricity]']
      ? {
          electricity: req.body['charges[electricity]'],
          maintenance: req.body['charges[maintenance]'],
          deposit: req.body['charges[deposit]'],
        }
      : undefined;

    // Handle amenities and rules
    const processedAmenities = amenities
      ? Array.isArray(amenities)
        ? amenities
        : [amenities]
      : undefined;

    const processedRules = rules
      ? Array.isArray(rules)
        ? rules
        : [rules]
      : undefined;

    // Handle images
    const images = req.files && req.files.length > 0 ? req.files.map(file => file.path) : undefined;

    // Prepare update object
    const updateData = {};
    if (sharing) updateData.sharing = sharing;
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (genderAllowed) updateData.genderAllowed = genderAllowed;
    if (rent) updateData.rent = rent;
    if (availability !== undefined) updateData.availability = availability;
    if (address) updateData.address = address;
    if (charges) updateData.charges = charges;
    if (processedAmenities) updateData.amenities = processedAmenities;
    if (processedRules) updateData.rules = processedRules;
    if (images) updateData.images = images; // Replace images; to append, use $push

    // Update PG
    const updatedPg = await pgDetailSchema.findByIdAndUpdate(pgId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedPg) {
      return res.status(404).json({ message: 'PG not found' });
    }

    res.status(200).json({
      message: 'PG details updated successfully',
      data: updatedPg,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.DeletePgDetails = async (req, res) => {
  try {
    const { pgId } = req.params;
    const adminId = req.user.id; // From verifyRole middleware

    // Verify PG exists
    const pg = await pgDetailSchema.findById(pgId);
    if (!pg) {
      return res.status(404).json({ message: 'PG not found' });
    }

    // Check if requester is the admin who created the PG or has admin role
    if (pg.adminId !== adminId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own PGs or need admin privileges' });
    }

    // Soft delete: Set isActive to false
    pg.isActive = false;
    await pg.save();

    // Optional: Hard delete (uncomment to use)
    // await pgDetailSchema.findByIdAndDelete(pgId);

    res.status(200).json({ message: 'PG deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.registerPgOwner = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      gender,
      phone,
      propertyAddress,
      registrationNumber,
    } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Extract file URLs from Cloudinary uploads
    const files = req.files;
    const pgDetails = {
      propertyAddress,
      registrationNumber,
      noc: files.noc ? files.noc[0].path : '',
      tradeLicense: files.tradeLicense ? files.tradeLicense[0].path : '',
      policeVerification: files.policeVerification ? files.policeVerification[0].path : '',
      gstRegistration: files.gstRegistration ? files.gstRegistration[0].path : '',
      propertyInsurance: files.propertyInsurance ? files.propertyInsurance[0].path : '',
      healthSanitationCertificate: files.healthSanitationCertificate ? files.healthSanitationCertificate[0].path : '',
    };

    const newUser = new UserSchema({
      username,
      email,
      password: hashedPassword, // Ensure to hash the password before saving
      gender,
      phone,
      role: 'pending_admin',
      pgDetails,
      applicationStatus: 'pending',
    });

    await newUser.save();
    console.log(newUser)
    res.status(201).json({ message: 'PG owner registered successfully. Awaiting approval.' });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Registration failed.' });
  }
};

// routes/admin.js
exports.approveAdmin=async (req, res) => {
  try {
    const adminId = req.params.id;
    // Update admin status to "approved" (e.g., in MongoDB)
    const admin = await UserSchema.findByIdAndUpdate(
      adminId,
      { applicationStatus: "approved",
        role:"admin"
       },
      { new: true }
    );
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    res.status(200).json({ message: "Admin approved" });
  } catch (error) {
    console.error("Error approving admin:", error);
    res.status(500).json({ error: "Server error" });
  }
}
exports.rejectAdmin=async (req, res) => {
  try {
    const adminId = req.params.id;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: "Rejection reason is required" });
    }

    const admin = await UserSchema.findByIdAndUpdate(
      adminId,
      { applicationStatus: "rejected", rejectionReason: reason,role:"rejected_admin" },
      { new: true }
    );

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.status(200).json({ message: "Admin rejected" });
  } catch (error) {
    console.error("Error rejecting admin:", error);
    res.status(500).json({ error: "Server error" });
  }
}
exports.GetAdminDetails= async (req, res) => {
  try {
    const user = await UserSchema.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
}
exports.GetAllAdminDetails=async (req,res)=>{
  try {
    const users = await UserSchema.find(
      { role: { $nin: ["user", "superadmin"] } }, // Exclude 'user' and 'superadmin' roles
      "username role phone applicationStatus"     // Select specific fields
    );
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users", error });
  }

}