const express = require("express");
const jwtAuth = require("../middleware/jwtAuth");

const ratingCtrl = require("../controller/rating");

const router = express.Router();

router.put("/",  ratingCtrl.addRating);//jwtAuth,
router.get("/", ratingCtrl.getPersonalRating); //jwtAuth,

module.exports = router;
