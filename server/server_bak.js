var express = require("express");

var https = require("https");

const path = require("path");

const fs = require("fs");

var router_upload = require("./process_upload");

var router_file = require("./file_manage");

var router_get = require("./process_get");

var router_db = require("./db_get");

var payment = require("./payment");

/*var app = express();*/

var root = path.resolve(process.argv[2] || "../client/dist");

var root1 = path.resolve(process.argv[2] || "../client");
var rootcrt = path.resolve(process.argv[2] || "./cert/worldtea.crt");
var rootkey = path.resolve(process.argv[2] || "./cert/worldkey.key");

const options = {
  key: fs.readFileSync(rootkey),
  cert: fs.readFileSync(rootcrt),
};

var app = express();

var httpsServer = https.createServer(options, app);

var expressWs = require("express-ws"); //for webSocket

expressWs(app);

var router_ws = require("./ws"); //for webSocket

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

/*var server = app.listen(4242, "127.0.0.1");

console.log("server run at port 4242");*/

httpsServer.listen(4243, function () {
  console.log("HTTPS Server is running on: https://localhost:%s", 4243);
});
