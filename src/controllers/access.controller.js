"use strict";

const { CREATED, successResponse, OK } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  handlerRefreshToken = async (req, res, next) => {
    new successResponse({
      message: "Get tokens successfully!",
      metadata: await AccessService.handlerRefreshToken({
        refreshToken: req.refreshToken,
        user: req.user,
        keyStore: req.keyStore,
      }),
    }).send(res);
  };

  logout = async (req, res, next) => {
    new successResponse({
      message: "Logout successfully!",
      metadata: await AccessService.logout(req.keyStore),
    }).send(res);
  };

  login = async (req, res, next) => {
    new successResponse({
      message: "Login successfully!",
      metadata: await AccessService.login(req.body),
    }).send(res);
  };

  sighUp = async (req, res, next) => {
    // console.log(`[P]::signUp`, req.body);
    new CREATED({
      message: "Registered Ok!",
      metadata: await AccessService.signUp(req.body),
      options: {
        limit: 10,
      },
    }).send(res);
    // return res.status(201).json(await AccessService.signUp(req.body));
  };
}

module.exports = new AccessController();
