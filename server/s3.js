require('dotenv').config()
const fs = require('fs')
const S3 = require('aws-sdk/clients/s3')


const bucketName="dollidogif"
const region="ap-northeast-2"
const accessKeyId="AKIAW47N43BHNCJFFRVP"
const secretAccessKey="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"

const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey
})

// uploads a file to s3
function uploadFile(file) {
    const fileStream = fs.createReadStream(file.path)
    decodeURIComponent(escape(file.filename))
    const uploadParams = {
      Bucket: bucketName,
      Body: fileStream,
      Key: file.originalname
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