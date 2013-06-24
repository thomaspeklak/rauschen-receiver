"use strict";

var version = require("./package").version;
var server = require("./server");
var distributor = require("./lib/distributor");
var path = require("path");
var environment = process.env.NODE_ENV || "development";
var seaport = {
    host: process.argv[2],
    port: process.argv[3]
};

var seaport = require("seaport");
var ports = seaport.connect(seaport.host, seaport.port);

var Scuttlebutt = require("scuttlebutt/model");
var client = require("rauschen-registry").client;
var config = new Scuttlebutt();

client(seaport.host, seaport.port, config.createStream());

config.on("data", function () {
    var domainRestrictor = require(
        path.join(__dirname, "lib", "domain-restrictor")
    )(config.get("data").domains);

    server.use(domainRestrictor);

    distributor(server, ports.register("distributor@" + version));

    server.listen(ports.register("receiver@" + version));

    if (process.send) {
        process.send("receiver turned on");

        process.on("exit", function () {
            process.send("receiver shutting down");
        });
    }
});

if (environment === "development") {
    new require("events-counter")(server, "new-request");
}
