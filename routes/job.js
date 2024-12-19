const express = require("express");
const jobCtrl = require("../controller/job");

// Middleware for JWT authentication
const jwtAuth = require("../middleware/jwtAuth");

// Create a router object from Express
const router = express.Router();

// Get, post công việc, yêu cầu xác thực JWT
router.post("/" , jobCtrl.addJob); //jwtAuth
router.get("/", jobCtrl.getJobList);
router.get("/:id", jobCtrl.getJobId);
router.get("/:id/applications", jobCtrl.getApplications); //jwtAuth
router.put("/:id", jobCtrl.updateJobDetails); //, jwtAuth
router.post("/:id/applications",  jobCtrl.applyJob);//jwtAuth,
router.get("/:id/check-accepted",  jobCtrl.checkApply);//jwtAuth,
router.delete("/:id",jobCtrl.deleteJob); //jwtAuth, 
router.get('/get/getJobCategory', jobCtrl.getJobCategory);

module.exports = router;
