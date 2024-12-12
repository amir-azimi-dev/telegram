const express = require("express");
const app = express();
const routes = require("./routes");

app.use(express.urlencoded({ extended: false, limit: "80mb" }));
app.use(express.json({ limit: "80mb" }));
app.use("/api/v1", routes);

module.exports = app;