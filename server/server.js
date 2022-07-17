import http from "http";
import cors from "cors";
import express from "express";
import webSocket from "./Routers/socket";

// routers import
import apiGifs from "./Routers/gifs";
import apiMember from "./Routers/member";
import apiTest from "./Routers/test";
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
const fs = require('fs')

const util = require('util')
const unlinkFile = util.promisify(fs.unlink)

const { uploadFile, getFileStream } = require('./s3')


const port = 5000;
const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.static('./server/public'));

app.get('/images/:key', (req, res) => {
    const key = req.params.key
    const readStream = getFileStream(key)
    readStream.pipe(res)
})

app.post('/images', upload.single('image'), async (req, res) => {
    const file = req.file
    console.log(file)

    const result =  await uploadFile(file)
    await unlinkFile(file.path)
    console.log(result)
    const description = req.body.description
    res.send({imagePath: `/images/${result.Key}`})
})

// routers
app.use("/api/test", apiTest);
app.use("/api/gifs", apiGifs);
app.use("/api/member", apiMember);

// webSocket, https 연결
webSocket(server);
server.listen(port, () => console.log("접속 완료"));