"use strict";

const { BadRequestError } = require("../core/error.response");
const { successResponse } = require("../core/success.response");
const UploadService = require("../services/upload.service");

class UploadController {
  uploadFile = async (req, res, next) => {
    new successResponse({
      message: "uploadFile success",
      metadata: await UploadService.uploadImageFromUrl(),
    }).send(res);
  };

  uploadFileThumb = async (req, res, next) => {
    const { file } = req;
    if (!file) {
      throw new BadRequestError("File missing");
    }
    new successResponse({
      message: "uploadFileThumb success",
      metadata: await UploadService.uploadImageFromLocal({
        path: file.path,
      }),
    }).send(res);
  };

  uploadImagesFromLocalFiles = async (req, res, next) => {
    const { files } = req;
    if (!files.length) {
      throw new BadRequestError("File missing");
    }
    new successResponse({
      message: "uploadImagesFromLocalFiles success",
      metadata: await UploadService.uploadImageFromLocalFiles({
        files,
      }),
    }).send(res);
  };

  // use s3client
  uploadImagesFromLocalS3 = async (req, res, next) => {
    const { file } = req;
    if (!file) {
      throw new BadRequestError("File missing");
    }
    new successResponse({
      message: "upload image success use s3Client",
      metadata: await UploadService.uploadImageFromLocalS3({
        file,
      }),
    }).send(res);
  };
}

module.exports = new UploadController();
