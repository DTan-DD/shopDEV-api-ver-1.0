require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const { default: helmet } = require("helmet");
const compression = require("compression");
const app = express();

// init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// test pub.sub redis
// const productTest = require("./test/product.test");
// require("./test/inventory.test");
// productTest.purchaseProduct("product:001", 10);

//  init db
// require("./dbs/init.mongodb");
// check overload
const { checkOverload } = require("./helper/check.connect");
// checkOverload();

//  init routes
app.use("/", require("./routes/index"));

// app.get("/", (req, res, next) => {
//   const strCompression = "hello";
//   return res.status(200).json({
//     message: "Welcome",
//     // metadata: strCompression.repeat(10000),
//   });
// });

//  handling error
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    stack: error.stack,
    message: error.message || "Internal Server Error",
  });
});

module.exports = app;
