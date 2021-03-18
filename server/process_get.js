const express = require("express");

const query = require("./db_get");

const fs = require("fs");
const url = require("url");
const path = require("path");

const bodyParser = require("body-parser");

const public_data = require("./public_data");

const router_get = express.Router();

var mimeType = public_data.mimeType;

const img_dir = "./static/upload";

router_get.use(
  bodyParser.urlencoded({
    extended: false // 为true时将使用qs库处理数据，通常不需要
  })
);

var root = path.resolve(process.argv[2] || img_dir);

router_get.get("/picture/:name", (req, res, next) => {
  var file_name = req.url.slice(9);

  var filepath = path.join(root, file_name);

  const ext = path.parse(filepath).ext;

  fs.readFile(filepath, (err, data) => {
    if (!err) {
      /* console.log(filepath + " read success");*/

      /* res.setHeader("Content-type", mimeType[ext] || "text/plain");*/
      res.setHeader(
        "Content-type",
        mimeType[ext] || " application/octet-stream"
      );

      res.end(data);
    } else {
      console.log("read pictute file error");
      res.end("picture file not found");
    }
  });
});

router_get.get("/json/:name", async (req, res, next) => {
  var file_name = req.url.slice(6);

  switch (file_name) {
    case "product":
      query.db_query_all_product(function(err, result) {
        var json_obj;
        if (!err) {
          json_obj = Object.values(JSON.parse(JSON.stringify(result)));

          res.end(JSON.stringify(tojson_product(json_obj)));
        } else {
          result = { id: 5555, msg: "not found" };
          res.end(JSON.stringify(result));
        }
      });
      break;

    case "product_catalog":
      query.db_query_all_catalog(function(err, result) {
        var json_obj;
        if (!err) {
          json_obj = Object.values(JSON.parse(JSON.stringify(result)));

          res.end(JSON.stringify(tojson_catalog(json_obj)));
        } else {
          result = { id: 5555, msg: "not found" };
          res.end(JSON.stringify(result));
        }
      });
      break;

    default:
      json_obj = { id: 5555, msg: "param err" };
      res.end(JSON.stringify(json_obj));
      break;
  }
});

function tojson_product(input_obj) {
  var json1;
  var json_array = [];

  for (var i = 0; i < input_obj.length; i++) {
    json1 = new Object();
    json1.id = input_obj[i].id;
    json1.content = input_obj[i].product_content;
    json1.pic_content = input_obj[i].link_pic;
    json1.catalog = input_obj[i].product_catalog;

    json_array.push(json1);
  }

  return json_array;
}

function tojson_catalog(input_obj) {
  var json1;
  var json_array = [];

  for (var i = 0; i < input_obj.length; i++) {
    json1 = new Object();
    json1.id = input_obj[i].id;
    json1.catalog_name = input_obj[i].catalog_name;
    json1.catalog_pic = input_obj[i].link_pic;

    json_array.push(json1);
  }

  return json_array;
}

module.exports = router_get;
