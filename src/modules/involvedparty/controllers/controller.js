"use strict";
var mongoose = require("mongoose"),
  model = require("../models/model"),
  mq = require("../../core/controllers/rabbitmq"),
  Involvedparty = mongoose.model("Involvedparty"),
  errorHandler = require("../../core/controllers/errors.server.controller"),
  _ = require("lodash"),
  request = require("request");


exports.getList = function (req, res) {
  var pageNo = parseInt(req.query.pageNo);
  var size = parseInt(req.query.size);
  var query = {};
  if (pageNo < 0 || pageNo === 0) {
    response = {
      error: true,
      message: "invalid page number, should start with 1",
    };
    return res.json(response);
  }
  query.skip = size * (pageNo - 1);
  query.limit = size;
  Involvedparty.find({}, {}, query, function (err, datas) {
    if (err) {
      return res.status(400).send({
        status: 400,
        message: errorHandler.getErrorMessage(err),
      });
    } else {
      res.jsonp({
        status: 200,
        data: datas,
      });
    }
  });
};

exports.create = function (req, res) {
  var newInvolvedparty = new Involvedparty(req.body);
  newInvolvedparty.createby = req.user;
  newInvolvedparty.save(function (err, data) {
    if (err) {
      return res.status(400).send({
        status: 400,
        message: errorHandler.getErrorMessage(err),
      });
    } else {
      res.jsonp({
        status: 200,
        data: data,
      });
      /**
       * Message Queue
       */
      // mq.publish('exchange', 'keymsg', JSON.stringify(newOrder));
    }
  });
};

exports.getByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      status: 400,
      message: "Id is invalid",
    });
  }

  Involvedparty.findById(id, function (err, data) {
    if (err) {
      return res.status(400).send({
        status: 400,
        message: errorHandler.getErrorMessage(err),
      });
    } else {
      req.data = data ? data : {};
      next();
    }
  });
};

exports.read = function (req, res) {
  res.jsonp({
    status: 200,
    data: req.data ? req.data : [],
  });
};

exports.update = function (req, res) {
  var updInvolvedparty = _.extend(req.data, req.body);
  updInvolvedparty.updated = new Date();
  updInvolvedparty.updateby = req.user;
  updInvolvedparty.save(function (err, data) {
    if (err) {
      return res.status(400).send({
        status: 400,
        message: errorHandler.getErrorMessage(err),
      });
    } else {
      res.jsonp({
        status: 200,
        data: data,
      });
    }
  });
};

exports.delete = function (req, res) {
  req.data.remove(function (err, data) {
    if (err) {
      return res.status(400).send({
        status: 400,
        message: errorHandler.getErrorMessage(err),
      });
    } else {
      res.jsonp({
        status: 200,
        data: data,
      });
    }
  });
};

exports.getUserProfile = (req, res, next) => {
  next();
};

exports.replyMessage = (req, res) => {
    let headers = {
        "Content-Type": "application/json",
        Authorization:
          "Bearer 7bmSZYoiFA0K+GJGqft+YICRldOb/ONI3LeKdOx7o4FSIvrsHVRXkvrAaQKIz5vZP4oPJO7EO/8n6gFddEgBCa6MsvyVjQnCs/ADVaT83nDEJXn3KsXXvT2Vd1Hbx5H+Lc9QD3G7lXhpbVOz6LjgaAdB04t89/1O/w1cDnyilFU=",
      };
      let body = JSON.stringify({
        replyToken: req.body.events[0].replyToken,
        messages: [
          {
            type: `text`,
            text: `${JSON.stringify(req.body.events[0])}`,
          },
        ],
      });
      request.post(
        {
          url: "https://api.line.me/v2/bot/message/reply",
          headers: headers,
          body: body,
        },
        (err, resp, body) => {
          console.log("status = " + resp.statusCode);
          res.jsonp(req.body.events[0]);
        }
      );
};

exports.sendMessage = (req, res) => {
    let headers = {
        "Content-Type": "application/json",
        Authorization:
          "Bearer 7bmSZYoiFA0K+GJGqft+YICRldOb/ONI3LeKdOx7o4FSIvrsHVRXkvrAaQKIz5vZP4oPJO7EO/8n6gFddEgBCa6MsvyVjQnCs/ADVaT83nDEJXn3KsXXvT2Vd1Hbx5H+Lc9QD3G7lXhpbVOz6LjgaAdB04t89/1O/w1cDnyilFU=",
      };
      let body = JSON.stringify(req.body);
      request.post(
        {
          url: "https://api.line.me/v2/bot/message/push",
          headers: headers,
          body: body,
        },
        (err, resp, body) => {
          console.log("status = " + resp.statusCode);
          res.jsonp({});
        }
      );
};


