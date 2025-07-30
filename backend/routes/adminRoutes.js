// // routes/pgRoutes.js
// const express = require('express');
// const router = express.Router();
// const upload = require('../middleware/multer');
// const { AddPgDetails } = require('../controller/adminController');

// router.post('/addPgDetail/:adminId',upload.array('images'), AddPgDetails);

// module.exports = router;
const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { AddPgDetails, GetPgs, UpdatePgDetails, DeletePgDetails ,GetAdminDetails,registerPgOwner,approveAdmin,rejectAdmin,GetAllAdminDetails} = require('../controller/adminController');
const {UpdateUser}=require("../controller/userController")
const verifyRole = require('../middleware/authMiddleware');
const documentUpload = require('../middleware/pgDocuments');

router.get('/pgDetails', verifyRole('admin'), GetPgs);
router.post('/addPgDetail/:adminId', verifyRole('admin'), upload.array('images'), AddPgDetails);
router.put('/updatePgDetail/:pgId', verifyRole('admin'), upload.array('images'), UpdatePgDetails);
router.delete('/deletePgDetail/:pgId', verifyRole('admin'), DeletePgDetails);
router.post(
  '/register-pg-owner',
  documentUpload.fields([
    { name: 'noc', maxCount: 1 },
    { name: 'tradeLicense', maxCount: 1 },
    { name: 'policeVerification', maxCount: 1 },
    { name: 'gstRegistration', maxCount: 1 },
    { name: 'propertyInsurance', maxCount: 1 },
    { name: 'healthSanitationCertificate', maxCount: 1 },
  ]),registerPgOwner
  
);
router.post("/approve_admin/:id",verifyRole("superadmin"),approveAdmin)
router.post("/reject_admin/:id", verifyRole("superadmin"),rejectAdmin)
router.get("/admin/:id",GetAdminDetails)
router.put("/admin/:id", verifyRole('admin' && 'superadmin' ), UpdateUser);
router.get("/getAllAdminDetails",verifyRole("superadmin"),GetAllAdminDetails)

module.exports = router;


