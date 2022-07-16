import express from "express";
const router = express.Router();

router.get("/login", (_, res) => {
    console.log("login");
});

module.exports = router;