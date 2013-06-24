"use strict";

var net = require("net");
var Scuttlebutt = require("scuttlebutt/model");
var timing = new Scuttlebutt();

var distributor = function (app, port) {
    app.on("data", function (data) {
        timing.set("data", data);
    });

    var server = net.createServer(function (stream) {
        stream.pipe(timing.createStream()).pipe(stream);
    });

    server.listen(port);
};


module.exports = distributor;
