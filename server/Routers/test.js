import express from "express";
const router = express.Router();

router.get("/test", (_, res) => {
    console.log("test");
    res.send({
        test: "test",
        name: "yunchan",
        status: "succes"
    });
});

module.exports = router;