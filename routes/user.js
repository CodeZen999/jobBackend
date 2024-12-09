const multer = require("multer");
const express = require("express");
const jwtAuth = require("../middleware/jwtAuth");

const userCtrl = require("../controller/user");
const upload = multer();

const router = express.Router();

router.get("/all", userCtrl.getAllUser);
router.get("/allApplicant", userCtrl.getAllUserApplicant);
router.get("/allRecruiter", userCtrl.getAllUserRecruiter);
router.get("/",  userCtrl.getUser); //jwtAuth,
router.get("/:id", userCtrl.getUserId);
router.get("/allRecruiter/:id", userCtrl.getIdRecruiter);
router.get("/allApplicant/:id", userCtrl.getIdApplicant);
router.put("/:id", upload.none(), userCtrl.updateUser);//jwtAuth, 
router.delete("/:id",  userCtrl.deleteUser); //jwtAuth,

module.exports = router;
