require('dotenv').config()
const fs = require('fs')
const S3 = require('aws-sdk/clients/s3')
// const sharp = require('sharp');

import { v4 as uuidv4 } from 'uuid';



const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey
})

// uploads a file to s3
function uploadFile(file, compressedFileStream, dirPath = "") {
  console.log(file.size);
  let fileStream;
  let fileName = file.originalname;
  if (!compressedFileStream) {
    fileStream = fs.createReadStream(file.path);
  } else {
    fileStream = compressedFileStream;
    fileName = fileName.substring(0, fileName.indexOf('.')) + '.webp'
  }
  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: dirPath + uuidv4() + fileName
  }

  return s3.upload(uploadParams).promise()
}
exports.uploadFile = uploadFile


//   downloads a file from s3
function getFileStream(fileKey) {
  const downloadParams = {
    Key: fileKey,
    Bucket: bucketName
  }

  return s3.getObject(downloadParams).createReadStream()
}
exports.getFileStream = getFileStream