const express = require("express");
const router = express.Router();
const namespaceRouter = require("./namespace");
const roomRouter = require("./room");

router.use("/namespaces", namespaceRouter);
router.use("/rooms", roomRouter);

module.exports = router;