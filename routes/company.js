const express = require("express");
const jwtAuth = require("../middleware/jwtAuth");

const companyCtrl = require("../controller/company");

const router = express.Router();

router.get("/", companyCtrl.getCompanyList); //jwtAuth

module.exports = router;
