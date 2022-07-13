const express = require("express");
const app = express();
const api = require("./Router/api");
const path = require("path");
const router = require("./Router/api");

app.use("/api", api);
app.use(express.static('public'));

const port = 5000;
app.listen(port, () => console.log(`${port}`));