var express = require("express");

var router_upload = require("./process_upload");

var router_file = require("./file_manage");

var router_get = require("./process_get");

var router_db = require("./db_get");

var router_pay = require("./payment");

var app = express();

app.use("/upload", router_upload);

app.use("/", router_file);

app.use("/get", router_get);

app.use("/pay", router_pay);

app.use("/dbget", router_db.router_db_get);

var server = app.listen(4242);

console.log("server run at port 4242");
