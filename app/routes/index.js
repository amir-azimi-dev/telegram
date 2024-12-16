const express = require("express");
const router = express.Router();
const namespaceRouter = require("./namespace");
const roomRouter = require("./room");
const authRouter = require("./auth");

router.use("/namespaces", namespaceRouter);
router.use("/rooms", roomRouter);
router.use("/auth", authRouter);

module.exports = router;