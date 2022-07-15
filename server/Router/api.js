import express from "express"
import fs from "fs";

const router = express.Router();
const testFolder = './server/public';

global.sendGIF = []
global.gifCount = 0;

router.get("/gifs", (req, res) => {
    fs.readdir(testFolder, (err, files)=>{
        if(err) {
            console.log(err);
            res.status(500).send({error: "Error getting test folder."});
        }
        gifCount = files.length;
        console.log(gifCount);
        res.send({file:files});
    });
    return gifCount;
});

router.get("/roomGIF", (req, res) => {
    if (sendGIF.length > 0) {
        sendGIF = [];
    }

    for(var i = 0; i < 22; i++) {
        const myRandomNumber = Math.floor(Math.random() * gifCount);
        if(!sendGIF.includes(myRandomNumber)) {
            sendGIF.push(0);
            sendGIF.push(myRandomNumber);
        } else {
            i--;
        }
    };

    console.log(gifCount);
    res.send({sendGIF});
});

module.exports = router;