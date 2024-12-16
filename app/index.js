const express = require("express");
const app = express();
const cors = require("cors");
const routes = require("./routes");
const path = require("path");

app.use(cors({
    origin: "*",
    credentials: true
}));
app.use(express.urlencoded({ extended: false, limit: "80mb" }));
app.use(express.json({ limit: "80mb" }));
app.use("/uploads", express.static(path.join(__dirname, "..", "public")));
app.use("/api/v1", routes);

module.exports = app;