// const express=require("express")
// const {feedbackDetails,FetchComplaints}=require("../controller/complaintsController")
// const verifyRole=require("../middleware/authMiddleware")
// const router = express.Router();
// router.post("/enquiryDetail/:userId",feedbackDetails)
// router.get("/fetchComplaints",FetchComplaints)

// module.exports=router;
const express = require("express")
const {
  feedbackDetails,
  FetchComplaints,
  updateComplaintStatus,
  addComplaintReply,
  archiveComplaint,
  fetchUserComplaints
} = require("../controller/complaintsController")
const verifyRole = require("../middleware/authMiddleware")
const router = express.Router()

router.post("/enquiryDetail/:userId", feedbackDetails)
router.get("/fetchComplaints", verifyRole("superadmin"), FetchComplaints)
router.patch("/complaints/:id/status", verifyRole("superadmin"), updateComplaintStatus)
router.post("/complaints/:id/replies", verifyRole("superadmin"), addComplaintReply)
router.patch("/complaints/:id/archive", verifyRole("superadmin"), archiveComplaint)
router.get("/userComplaints/:userId", verifyRole("user"), fetchUserComplaints)

module.exports = router
