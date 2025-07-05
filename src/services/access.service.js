"use strict";
const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokensPair, verifyJWT } = require("../auth/authUtil");
const { getInfoData } = require("../utils");
const { BadRequestError, AuthFailureError, ForbiddenError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");
const keyTokenModel = require("../models/keyToken.model");

const roleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  /**
   * check token used?
   */
  static handlerRefreshToken = async ({ refreshToken, user, keyStore }) => {
    // console.log(user);
    const { userId, email } = user;
    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenError("Something wrong happen! Please login again");
    }

    if (keyStore.refreshToken !== refreshToken) throw new AuthFailureError("Shop not registered! 1");
    // check userId
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new AuthFailureError("Shop not registered! 2");

    // create cap token moi
    const tokens = await createTokensPair({ userId, email }, keyStore.publicKey, keyStore.privateKey);

    // update token
    await keyStore.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokensUsed: refreshToken, //da duoc su dung de lay token moi
      },
    });

    return {
      user,
      tokens,
    };
  };

  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id);
    return delKey;
  };
  /**
   * 1 - check email in dbs
   * 2 - match password
   * 3 - create AT and RT and save
   * 4 - generate tokens
   * 5 - get data return login
   */
  static login = async ({ email, password, refreshToken = null }) => {
    const foundShop = await findByEmail({ email });

    // 1.
    if (!foundShop) {
      throw new BadRequestError("Shop not registered!");
    }

    // 2.
    const match = bcrypt.compare(password, foundShop.password);
    if (!match) throw new AuthFailureError("Authentication error!");

    // 3.
    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");

    // 4.
    const { _id: userId } = foundShop;
    const tokens = await createTokensPair({ userId, email }, publicKey, privateKey);
    await KeyTokenService.createKeyToken({
      refreshToken: tokens.refreshToken,
      privateKey,
      publicKey,
      userId,
    });
    return {
      metadata: {
        shop: getInfoData({ fields: ["_id", "name", "email"], object: foundShop }),
        tokens,
      },
    };
  };

  static signUp = async ({ name, email, password }) => {
    // try {
    // check email exists
    const holderShop = await shopModel.findOne({ email }).lean();
    if (holderShop) {
      throw new BadRequestError("Error: Shop already registered!");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [roleShop.SHOP],
    });

    if (newShop) {
      // created privateKey, publicKey
      // cách cáo cấp, phức tạp
      // const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      //   modulusLength: 4096,
      //   publicKeyEncoding: {
      //     type: "pkcs1",
      //     format: "pem",
      //   },
      //   privateKeyEncoding: {
      //     type: "pkcs1",
      //     format: "pem",
      //   },
      // });
      // Public key CryptoGraphy Standards!

      // cách đơn giản hơn
      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");

      console.log({ privateKey, publicKey }); // save collection KeyStore

      // const publicKeyString = await KeyTokenService.createKeyToken({ //cach 1
      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        // cách 2:
        privateKey,
      });

      // cách 1
      // if (!publicKeyString) {
      //   return {
      //     code: "xxx",
      //     message: "publicKeyString error"
      //   };
      // }

      if (!keyStore) {
        // throw new BadRequestError("Error: keyStore error!");

        return {
          code: "xxx",
          message: "keyStore error",
        };
      }

      // cách 1
      // const publicKeyObject = crypto.createPublicKey(publicKeyString);
      // console.log(`publicKeyObject:`, publicKeyObject);

      // create token pair
      // cách 1
      // const tokens = await createTokensPair({ userId: newShop._id, email }, publicKeyString, privateKey);
      const tokens = await createTokensPair({ userId: newShop._id, email }, publicKey, privateKey);
      console.log(`Created token success`, tokens);

      return {
        code: 201,
        metadata: {
          shop: getInfoData({ fields: ["_id", "name", "email"], object: newShop }),
          tokens,
        },
      };
    }

    return {
      code: 200,
      metadata: null,
    };
    // } catch (error) {
    //   return {
    //     code: "xxx",
    //     message: error.message,
    //     status: "error",
    //   };
    // }
  };
}

module.exports = AccessService;
