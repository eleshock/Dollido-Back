const express = require("express");
const app = express();
const test = require("./Router/test");
const path = require("path");
const router = require("./Router/test");

app.use("/api", test);
app.use(express.static('public'));

const port = 5000;
app.listen(port, () => console.log(`${port}`));