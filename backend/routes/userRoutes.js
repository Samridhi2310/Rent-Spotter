// const express=require("express");
// const {CreateUser,CheckUser}=require("../controller/userController")
// const router=express.Router();
// router.post("/signup",CreateUser);
// router.post("/login",CheckUser);
// module.exports=router;
const express = require("express");
const { CreateUser, CheckUser, SyncUser, GetUser, UpdateUser, DeleteUser,getPendingAdmins } = require("../controller/userController");
const verifyRole = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/signup", CreateUser);
router.post("/login", CheckUser);
router.post("/user/sync", SyncUser);
router.get("/user/:id", GetUser);
router.put("/user/:id", verifyRole('user'), UpdateUser);
router.delete("/user/:id", verifyRole('user'), DeleteUser);
router.get('/pending_admins',verifyRole("superadmin"), getPendingAdmins);

module.exports = router;