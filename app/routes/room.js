const express = require("express");
const controller = require("../controllers/room");
const multerStorage = require("../middlewares/multer");
const path = require("path");

const filepath = path.join(__dirname, "..", "..", "public", "rooms");
const upload = multerStorage(filepath);

const router = express.Router();

router.post("/", upload.single("image"), controller.create);

module.exports = router;