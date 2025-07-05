"use strict";

const cloudinary = require("../configs/cloudinary.config");
const { s3, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("../configs/s3.config");
const crypto = require("crypto");
// const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { getSignedUrl } = require("@aws-sdk/cloudfront-signer");
const randomImageName = () => crypto.randomBytes(16).toString("hex");
const urlImagePublic = `https://d15oni0t2xiwgd.cloudfront.net`;

// upload file use S3Client

// 1. upload image from local
const uploadImageFromLocalS3 = async ({ file }) => {
  try {
    const imageName = randomImageName();
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: imageName, // file.originalName || "unKnow",
      Body: file.buffer,
      ContentType: "image/jpeg", // that is what you need
    });

    // export url

    const result = await s3.send(command);
    console.log(result);

    const signalUrl = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: imageName,
    });
    // s3
    // const url = await getSignedUrl(s3, signalUrl, { expiresIn: 3600 });

    // have cloudfront url export
    const url = getSignedUrl({
      url: `${urlImagePublic}/${imageName}`,
      keyPairId: process.env.AWS_BUCKET_PUBLIC_KEY,
      dateLessThan: new Date(Date.now() + 1000 * 60), //het han trong 60 giay
      privateKey: process.env.AWS_BUCKET_PRIVATE_KEY,
    });
    console.log("url::", url);
    return {
      url,
      result,
    };
  } catch (error) {
    console.error("error while uploading file use S3Client::", error);
  }
};

// end s3 service

// 1. upload from url images
const uploadImageFromUrl = async () => {
  try {
    const urlImage = "https://pokemonviet.com/wp-content/uploads/2020/11/PK13.png";
    const folderName = "product/shopId",
      newFileName = "testdemo";

    const result = await cloudinary.uploader.upload(urlImage, {
      public_id: newFileName,
      folder: folderName,
    });
    console.log(result);
    return result;
  } catch (error) {
    console.error("error while uploading file::", error);
  }
};

// 2. upload image from local
const uploadImageFromLocal = async ({ path, folderName = "product/shopId" }) => {
  try {
    const result = await cloudinary.uploader.upload(path, {
      public_id: "thumb",
      folder: folderName,
    });
    console.log(result);
    return {
      image_url: result.secure_url,
      shopId: "0000",
      thumb_url: await cloudinary.url(result.public_id, {
        height: 200,
        width: 200,
        format: "jpg",
      }),
    };
  } catch (error) {
    console.error("error while uploading file::", error);
  }
};

// 3. upload images from local
const uploadImageFromLocalFiles = async ({ files, folderName = "product/shopId" }) => {
  try {
    if (!files.length) return;

    const uploaderUrls = [];
    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: folderName,
      });

      uploaderUrls.push({
        image_url: result.secure_url,
        shopId: "0000",
        thumb_url: await cloudinary.url(result.public_id, {
          //   height: 200,
          //   width: 200,
          format: "jpg",
        }),
      });
    }

    return uploaderUrls;
  } catch (error) {
    console.error("error while uploading file::", error);
  }
};

module.exports = { uploadImageFromUrl, uploadImageFromLocal, uploadImageFromLocalFiles, uploadImageFromLocalS3 };
