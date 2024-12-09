const express = require("express");
const authCtrl = require("../controller/auth");
const jwtAuth = require("../middleware/jwtAuth");

// Create a router object from Express
const router = express.Router();
// Create Login,SignUp for user
router.post("/register", authCtrl.Register);
router.post("/login", authCtrl.Login);
router.get("/my-account", jwtAuth, authCtrl.getUser);
router.post("/password/forgot", authCtrl.forgotPassword);
router.put("/password/reset", authCtrl.resetPassword);
router.post("/send_recovery_email", authCtrl.sendEmail);
router.post("/verify_otp", authCtrl.VerifyEmail);
router.post("/google", authCtrl.googleLogin); 

module.exports = router;
