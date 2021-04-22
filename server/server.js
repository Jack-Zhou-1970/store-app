var express = require("express");

var expressWs = require("express-ws"); //for webSocket

const path = require("path");

var router_upload = require("./process_upload");

var router_file = require("./file_manage");

var router_get = require("./process_get");

var router_db = require("./db_get");

var router_ws = require("./ws"); //for webSocket

var payment = require("./payment");

var app = express();

var root = path.resolve(process.argv[2] || "../client/dist");

var root1 = path.resolve(process.argv[2] || "../client");

expressWs(app);

app.use("/ws", router_ws.router_ws); //webSocket process*/

app.use(express.static(root));

app.use("/upload", router_upload);

/*app.use("/", router_file);*/

app.use("/get", router_get);

app.use("/pay", payment.router_pay);

app.use("/dbget", router_db.router_db_get);

app.get("*", function (request, response) {
  response.sendFile(path.resolve(root1, "dist", "index.html"));
});

var server = app.listen(4242, "192.168.0.128");

console.log("server run at port 4242");
