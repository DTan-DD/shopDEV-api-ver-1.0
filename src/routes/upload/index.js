"use strict";

const express = require("express");
const uploadController = require("../../controllers/upload.controller");
const { asyncHandler } = require("../../auth/checkAuth");
const { authenticationV2 } = require("../../auth/authUtil");
const { uploadDisk, uploadMemory } = require("../../configs/multer.config");
const router = express.Router();

// router.use(authenticationV2);
router.post("/product", asyncHandler(uploadController.uploadFile));
router.post("/product/thumb", uploadDisk.single("file"), asyncHandler(uploadController.uploadFileThumb));
router.post("/product/multiple", uploadDisk.array("files", 3), asyncHandler(uploadController.uploadImagesFromLocalFiles));

// upload s3
router.post("/product/bucket", uploadMemory.single("file"), asyncHandler(uploadController.uploadImagesFromLocalS3));

module.exports = router;
