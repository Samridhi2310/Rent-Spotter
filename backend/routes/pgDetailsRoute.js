const express = require("express");
const upload = require("../middleware/multer");
const { checkAdminOwnership } = require("../middleware/checkAdminOwnership");
const verifyRole = require("../middleware/authMiddleware");
const {
  ShowPgDetails,
  updatedPgDetail,
  deletedPgDetail,
  getMyPgDetails,
  getPGDetailsForSuperadmin
} = require("../controller/pgDetailsController");

const router = express.Router();
router.post("/pg", ShowPgDetails);
router.get("/my-pgs/:adminId", verifyRole("admin"), getMyPgDetails);
router.delete(
  "/pg/:pgDetailId",
  verifyRole("admin"),
  checkAdminOwnership,
  deletedPgDetail
);
router.put(
  "/pg/:pgDetailId",
  verifyRole("admin"),
  upload.array("images"),
  checkAdminOwnership,
  updatedPgDetail
);
router.get('/pg-details', verifyRole("superadmin"), getPGDetailsForSuperadmin);


module.exports = router;