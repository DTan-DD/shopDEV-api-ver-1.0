"use strict";

// Require the cloudinary library
const cloudinary = require("cloudinary").v2;

// Return "https" URLs by setting secure: true
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, //'srRN91VapHbkLq_kEDrnyO6J6O0'
});

// Log the configuration
// console.log(cloudinary.config());
module.exports = cloudinary;
