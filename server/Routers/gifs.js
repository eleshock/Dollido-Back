import authUtil from "./member/auth";
import { Router } from "express";
import fs from "fs";
const router = Router();
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
require('dotenv').config()
const S3 = require('aws-sdk/clients/s3')


const bucketName = process.env.AWS_BUCKET_NAME
const region=process.env.AWS_BUCKET_REGION
const accessKeyId=process.env.AWS_ACCESS_KEY
const secretAccessKey=process.env.AWS_SECRET_KEY

const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey
})

const util = require('util')
const unlinkFile = util.promisify(fs.unlink)

const { uploadFile, getFileStream } = require('../s3')



global.sendGIF = [];
global.gifCount = 0;

router.get('/imagesk/:key', authUtil, (req, res) => {
    const key = req.params.key
    const readStream = getFileStream(key)
    readStream.pipe(res)
})

router.post('/images', authUtil, upload.single('image'), async (req, res) => {
    try{
        const file = req.file
        console.log(file)
        const result =  await uploadFile(file)
        await unlinkFile(file.path)
        console.log(result)
        res.send({imagePath: `api/gifs/images/${result.Key}`})
    } catch (e) {

        console.error(e);
    }
})

router.get('/list', authUtil, async(req,res)=> {
    try{
        let r = await s3.listObjectsV2({Bucket:bucketName}).promise()
        let x = r.Contents.map(item=>item.Key);
        gifCount = x.length;
        res.send(x)
    } catch (e) {
        console.error(e);
    }
    return gifCount;
  })

router.get("/roomGIF", authUtil, (_, res) => {
    if (sendGIF.length > 0) {
        sendGIF = [];
    };

    for(var i = 0; i < 22; i++) {
        const myRandomNumber = Math.floor(Math.random() * gifCount);
        if(!sendGIF.includes(myRandomNumber)) {
            sendGIF.push(myRandomNumber);
        } else {
            i--;
        }
    };

    console.log(gifCount);
    res.send({sendGIF});
});

module.exports = router;