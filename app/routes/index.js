const express = require("express");
const router = express.Router();
const namespaceRouter = require("./namespace");

router.use("/namespaces", namespaceRouter);

module.exports = router;