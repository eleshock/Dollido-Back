const express = require("express");
const router = express.Router();
const path = require("path")
const testFolder = './public';
var fs = require('fs');
const { send } = require("process");

global.sendGIF = []
global.gifCount = 0;
// router.get("/home", (_, res) => {
//     console.log("hi");
// });

router.get("/home", (req, res) => {
    console.log("hi");
    res.send({test: "hi"});
});

router.get("/roomList", (req, res) => {
    console.log("hi");
});

router.get("/gifs", (req, res) => {
    fs.readdir(testFolder, (err, files)=>{
        if(err) {
            console.log(err);
            res.status(500).send({error: "Error getting test folder."});
        }
        gifCount = files.length;
        console.log(gifCount);
        res.send({file:files});
        // res.send({sendGIF});
    });
    return gifCount;
});

router.get("/roomGIF", (req, res) => {
    if (sendGIF.length > 0) {
        sendGIF = [];
    }

    for(i = 0; i < 22; i++) {
        const myRandomNumber = Math.floor(Math.random() * gifCount);
        if(!sendGIF.includes(myRandomNumber)) {
            sendGIF.push(0);
            sendGIF.push(myRandomNumber);
        }else {
            i--;
        }
    };

    console.log(gifCount);
    res.send({sendGIF});
});

module.exports = router;