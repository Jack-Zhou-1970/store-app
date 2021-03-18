const express = require("express");

const fs = require("fs");
const url = require("url");
const path = require("path");

const public_data = require("./public_data");

var mimeType = public_data.mimeType;

const router_file = express.Router();

var root = path.resolve(process.argv[2] || "../client/dist");

router_file.get("/:name", (req, res, next) => {
  var pathname = url.parse(req.url).pathname;

  var filepath = path.join(root, pathname);
  const ext = path.parse(filepath).ext;

  fs.readFile(filepath, (err, data) => {
    if (!err) {
      res.setHeader("Content-type", mimeType[ext] || "text/plain");
      res.end(data);
    } else {
      console.log("read error");
      res.end("404 not found");
    }
  });
});

module.exports = router_file;
