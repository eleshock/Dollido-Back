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


router.get('/imagesk/:key', (req, res) => {
    const key = req.params.key
    const readStream = getFileStream(key)
    readStream.pipe(res)
})

router.post('/images', upload.single('image'), async (req, res) => {
    try{
        const file = req.file
        console.log(file)
        const result =  await uploadFile(file)
        await unlinkFile(file.path)
        res.send({imagePath: `api/gifs/images/${result.Key}`})
    } catch (e) {

        console.error(e);
    }
})

router.get('/list', async(req,res)=> {
    let gifCount = 0;

    try{
        let r = await s3.listObjectsV2({Bucket:bucketName}).promise()
        let x = r.Contents.map(item=>item.Key);
        gifCount = x.length;
        console.log("여기서" + gifCount)
        global.gifCount = gifCount;

        res.send(x)
    } catch (e) {
        console.error(e);
    }
    return gifCount;
  })


module.exports = router;