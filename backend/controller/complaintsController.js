// const EnquiryDetails=require("../model/complaints")
// exports.feedbackDetails = async (req, res) => {
//     const userId = req.params.userId;
//     const { Name, Email, EnquiryType, Message, PhoneNumber } = req.body;

//     try {
//         const details = await EnquiryDetails.create({
//             Name,
//             Email,
//             PhoneNumber,
//             EnquiryType,
//             Message,
//             user: userId
//         });
//         console.log("Enquiry Details Stored:", details);
//         res.status(201).json({ message: "Enquiry details saved successfully" });
//     } catch (err) {
//         res.status(500).json({ message: "Internal Server Error", error: err.message });
//     }
// };

// exports.FetchComplaints = async (req, res) => {
//     try {
//         const complaints = await EnquiryDetails.find().populate("user", "name email"); // optional: populate user details
//         res.status(200).json({ complaints });
//     } catch (err) {
//         res.status(500).json({ message: "Failed to fetch complaints", error: err.message });
//     }
// };
const EnquiryDetails = require("../model/complaints")

exports.feedbackDetails = async (req, res) => {
  const userId = req.params.userId
  const { Name, Email, EnquiryType, Message, PhoneNumber } = req.body

  try {
    const details = await EnquiryDetails.create({
      Name,
      Email,
      PhoneNumber,
      EnquiryType,
      Message,
      user: userId,
    })
    console.log("Enquiry Details Stored:", details)
    res.status(201).json({ message: "Enquiry details saved successfully", complaint: details })
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err.message })
  }
}

exports.FetchComplaints = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status } = req.query;

    let query = {};
    if (status && status !== "All") {
      if (status === "Archived") {
        query = { isArchived: true };
      } else {
        query = { status, isArchived: false };
      }
    } else {
      query = { isArchived: false };
    }

    const complaints = await EnquiryDetails.find(query)
      .populate("user", "name email")
      .populate("replies.adminId", "name email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await EnquiryDetails.countDocuments(query);
    const hasMore = page * limit < total;

    res.status(200).json({ complaints, hasMore, total });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch complaints", error: err.message });
  }
};
exports.updateComplaintStatus = async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  try {
    const complaint = await EnquiryDetails.findByIdAndUpdate(id, { status, updatedAt: Date.now() }, { new: true })
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" })
    }
    res.status(200).json({ message: "Status updated", complaint })
  } catch (err) {
    res.status(500).json({ message: "Failed to update status", error: err.message })
  }
}

exports.addComplaintReply = async (req, res) => {
  const { id } = req.params;
  const { message, adminId } = req.body;
  if (!message || !adminId) {
    return res.status(400).json({ message: "Message and adminId are required" });
  }
  try {
    const complaint = await EnquiryDetails.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    const reply = { adminId, message, createdAt: Date.now() };
    complaint.replies.push(reply);
    complaint.updatedAt = Date.now();
    await complaint.save();

    // Populate the admin details for the new reply
    const populatedComplaint = await EnquiryDetails.findById(id)
      .populate("replies.adminId", "name email")
      .lean();
    const newReply = populatedComplaint.replies[populatedComplaint.replies.length - 1];

    res.status(201).json({ message: "Reply added", reply: newReply });
  } catch (err) {
    res.status(500).json({ message: "Failed to add reply", error: err.message });
  }
};
exports.archiveComplaint = async (req, res) => {
  const { id } = req.params

  try {
    const complaint = await EnquiryDetails.findByIdAndUpdate(
      id,
      { isArchived: true, status: "Archived", updatedAt: Date.now() },
      { new: true },
    )
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" })
    }
    res.status(200).json({ message: "Complaint archived", complaint })
  } catch (err) {
    res.status(500).json({ message: "Failed to archive complaint", error: err.message })
  }
}
exports.fetchUserComplaints = async (req, res) => {
  try {
    const userId = req.params.userId; // Assuming verifyToken middleware adds user to req
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status } = req.query;

    let query = { user: userId };
    if (status && status !== "All") {
      if (status === "Archived") {
        query.isArchived = true;
      } else {
        query.status = status;
        query.isArchived = false;
      }
    } else {
      query.isArchived = false;
    }

    const complaints = await EnquiryDetails.find(query)
      .populate("user", "name email")
      .populate("replies.adminId", "name email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await EnquiryDetails.countDocuments(query);
    const hasMore = page * limit < total;

    res.status(200).json({ complaints, hasMore, total });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user complaints", error: err.message });
  }
};
