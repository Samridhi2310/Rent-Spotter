// const UserSchema=require("../model/user");
// const bcrypt=require("bcryptjs")
// exports.CreateUser= async (req,res)=>{
//      try {
//         const {username,email,password,gender,phone}=req.body;
//         const hashedPassword=await bcrypt.hash(password,10)
//         const data=await UserSchema.create({username:username,email:email,password:hashedPassword,gender:gender,phone:phone})
//         console.log(data);
//         res.status(201).json({ message: "User details saved successfully" });
//          } catch (err) {
//              if (err.code === 11000) {
//                  return res.status(400).json({ message: "Email must be unique" });
//              }
//              res.status(500).json({ message: "Internal Server Error", error: err.message });
//          }
         
// }
// exports.CheckUser = async (req, res) => {
//     try {
//       const { username, password } = req.body;
  
//       // Find user by username
//       const user = await UserSchema.findOne({ username });
  
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
  
//       // Check password
//       const checkPassword = await bcrypt.compare(password, user.password);
  
//       if (!checkPassword) {
//         return res.status(401).json({ message: "Password does not match" });
//       }
//       console.log(user._id)
  
//       // Successful login
//       return res.status(200).json({
//         username: user.username,
//         email: user.email,
//         role: user.role,
//         id:user._id
//       });
  
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ message: "Server error", error: err.message });
//     }
//   };
const UserSchema = require("../model/user");
const bcrypt = require("bcryptjs");

exports.CreateUser = async (req, res) => {
  try {
    const { username, email, password, gender, phone } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const data = await UserSchema.create({
      username,
      email,
      password: hashedPassword,
      gender,
      phone,
    });
    console.log(data);
    res.status(201).json({ message: "User details saved successfully" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email must be unique" });
    }
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

exports.CheckUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await UserSchema.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check password if provided
    if (password) {
      const checkPassword = await bcrypt.compare(password, user.password);
      if (!checkPassword) {
        return res.status(401).json({ message: "Password does not match" });
      }
    }

    console.log(user);

    // Return user data
    return res.status(200).json({
      username: user.username,
      email: user.email,
      role: user.role,
      id: user._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.SyncUser = async (req, res) => {
  try {
    const { email, username, provider } = req.body;
    if (!email || !username) {
      return res.status(400).json({ message: "Email and username are required" });
    }

    // Check if user exists
    let user = await UserSchema.findOne({ email });
    if (!user) {
      // Create new user for social provider
      user = await UserSchema.create({
        username,
        email,
        password: "social-provider-" + Math.random().toString(36).slice(2), // Dummy password
        gender: "unknown", // Default, can be updated later
        phone: "unknown", // Default, can be updated later
        role: "user",
        provider,
      });
    } else {
      // Update existing user
      user.username = username;
      user.provider = provider;
      await user.save();
    }

    res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email must be unique" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.GetUser = async (req, res) => {
  try {
    const {id}=req.params;
    const user = await UserSchema.findById(id);

    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    res.status(200).json({
      username: user.username,
      email: user.email,
      gender: user.gender,
      phone: user.phone,
      role: user.role,
      id: user._id,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.UpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, gender, phone, role } = req.body;
    console.log(id)

    // Verify user exists
    const user = await UserSchema.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Prepare update object
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (gender) updateData.gender = gender;
    if (phone) updateData.phone = phone;


    // Update user
    const updatedUser = await UserSchema.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    console.log(updatedUser)

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User details updated successfully",
      user: {
        username: updatedUser.username,
        email: updatedUser.email,
        gender: updatedUser.gender,
        phone: updatedUser.phone,
        role: updatedUser.role,
        id: updatedUser._id,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email must be unique" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.DeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify user exists
    const user = await UserSchema.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the requester is the user themselves or an admin
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden: You can only delete your own account or need admin privileges" });
    }

    // Soft delete: Set isActive to false
    user.isActive = false;
    await user.save();

    // Optional: Hard delete (uncomment to use)
    // await UserSchema.findByIdAndDelete(id);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
exports.getPendingAdmins = async (req, res) => {
  try {
    const pendingAdmins = await UserSchema.find({ role: 'pending_admin' });
    res.status(200).json(pendingAdmins);
  } catch (error) {
    console.error('Error fetching pending admins:', error);
    res.status(500).json({ error: 'Failed to fetch pending admins.' });
  }
};
