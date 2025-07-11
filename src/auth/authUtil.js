"use strict";

const JWT = require("jsonwebtoken");
const asyncHandler = require("../helper/asyncHandler");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const { findByUserId } = require("../services/keyToken.service");

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "athorization",
  REFRESHTOKEN: "x-rtoken-id",
};

const createTokensPair = async (payload, publicKey, privateKey) => {
  try {
    // access token
    // cách 1
    // const accessToken = await JWT.sign(payload, privateKey, {
    const accessToken = await JWT.sign(payload, publicKey, {
      // cách 1:
      // algorithm: "RS256",
      expiresIn: "2 days",
    });

    // refreshToken
    const refreshToken = await JWT.sign(payload, privateKey, {
      // algorithm: "RS256",
      expiresIn: "7 days",
    });

    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.log("error verify", err);
      } else {
        console.log("decode verify", decode);
      }
    });
    return { accessToken, refreshToken };
  } catch (error) {}
};

const authentication = asyncHandler(async (req, res, next) => {
  /**
   * 1 - check userId missing
   * 2 - get accessToken
   * 3- verify tokens
   * 4 - check user in dbs
   * 5 - check keyStore with this userId?
   * 6 - Ok all -> return next()
   */

  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new AuthFailureError("Invalid Request");

  // 2.
  const keyStore = await findByUserId(userId);
  if (!keyStore) throw new NotFoundError("Not found keyStore");

  // 3.
  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) throw new AuthFailureError("Invalid Request");

  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    if (userId !== decodeUser.userId) {
      // can refresh token
      throw new AuthFailureError("Invalid UserId");
    }
    req.keyStore = keyStore;
    return next();
  } catch (error) {
    // throw error;
    if (error.name === "TokenExpiredError") {
      throw new AuthFailureError("Access Token Expired");
    }
    throw new AuthFailureError("Invalid Access Token");
  }
});

const authenticationV2 = asyncHandler(async (req, res, next) => {
  /**
   * 1 - check userId missing
   * 2 - get accessToken
   * 3- verify tokens
   * 4 - check user in dbs
   * 5 - check keyStore with this userId?
   * 6 - Ok all -> return next()
   */

  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new AuthFailureError("Invalid Request");

  // 2.
  const keyStore = await findByUserId(userId);
  if (!keyStore) throw new NotFoundError("Not found keyStore");

  // 3.
  if (req.headers[HEADER.REFRESHTOKEN]) {
    try {
      const refreshToken = req.headers[HEADER.REFRESHTOKEN];
      const decodeUser = JWT.verify(refreshToken, keyStore.privateKey);
      if (userId !== decodeUser.userId) {
        throw new AuthFailureError("Invalid UserId");
      }
      req.keyStore = keyStore;
      req.user = decodeUser; // {userId, email}
      req.refreshToken = refreshToken;

      return next();
    } catch (error) {
      // throw error;
      if (error.name === "TokenExpiredError") {
        throw new AuthFailureError("Access Token Expired");
      }
      throw new AuthFailureError("Invalid Access Token");
    }
  }

  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) throw new AuthFailureError("Invalid Request");

  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    if (userId !== decodeUser.userId) {
      throw new AuthFailureError("Invalid UserId");
    }
    req.keyStore = keyStore;
    return next();
  } catch (error) {
    // throw error;
    if (error.name === "TokenExpiredError") {
      throw new AuthFailureError("Access Token Expired");
    }
    throw new AuthFailureError("Invalid Access Token");
  }
});

const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret);
};

module.exports = { createTokensPair, authentication, verifyJWT, authenticationV2 };
