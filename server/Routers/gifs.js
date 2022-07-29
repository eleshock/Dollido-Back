import authUtil from "./member/auth";
import { Router } from "express";
import fs from "fs";
import queryGet from "../modules/db_connect";
import gifsQuery from "../query/gifs";
import inventoryQuery from "../query/inventory";

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
let gifCount = 0;
let x;
s3.listObjectsV2({Bucket:bucketName}).promise().then((r) => {
    x = r.Contents.map(item=>item.Key);
    gifCount = x.length;
    console.log("여기서" + gifCount)
    global.gifCount = gifCount;
});

router.get('/list-update', async(req,res)=> {
    r = await s3.listObjectsV2({Bucket:bucketName}).promise();
    x = r.Contents.map(item=>item.Key);
    gifCount = x.length;
    console.log("여기서" + gifCount)
    global.gifCount = gifCount;
});

const util = require('util')
const unlinkFile = util.promisify(fs.unlink)

const { uploadFile, getFileStream } = require('../s3')


router.get('/images/:key', (req, res) => {
    const key = req.params.key
    const readStream = getFileStream(key)
    readStream.pipe(res)
})

router.post('/images', upload.single('image'), authUtil, async (req, res) => {
    try{
        const file = req.file;
        console.log(file);
        const result =  await uploadFile(file);
        console.log(result);
        const member_id = req.idx
        let img_id = 0;
        let inventory_id = 0;
        const args = [member_id, 0, file.originalname, result.key];

        await unlinkFile(file.path);
        await queryGet(gifsQuery.insertGif, args);
        await queryGet(gifsQuery.findImageIdByImageServer, result.key)
            .then((info) => {
                if (info[0] != undefined) {
                    img_id = info[0].image_id;
                    console.log(info);
                }
            });

        await queryGet(inventoryQuery.findById, [member_id])
        .then((info) => {
            console.log(info[0])
            if (info[0] != undefined) {
                inventory_id = info[0].inventory_id;
            }
        })

        if (inventory_id){
            await queryGet(inventoryQuery.updateInventory, [img_id, req.idx]);
        } else {
            await queryGet(inventoryQuery.insertInventory, [req.idx, img_id]);
        }

        res.send({imagePath: result.key});
    } catch (e) {
        console.error(e);
    }
})

router.get('/list', async(req,res)=> {
    try{
        res.send(x)
    } catch (e) {
        console.error(e);
    }
    return gifCount;
  })


module.exports = router;