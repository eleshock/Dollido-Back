const express = require("express");
const router = express.Router();
const path = require("path")

router.get("/home", (_, res) => {
    res.send({test: "hi"});
});

router.get("/roomList", (rep, res) => {
    console.log("hi");
});

module.exports = router;