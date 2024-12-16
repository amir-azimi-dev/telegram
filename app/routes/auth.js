const express = require("express");
const controller = require("../controllers/auth");

const router = express.Router();

router.get("/", controller.getUserInfo);
router.post("/", controller.authenticate);

module.exports = router;