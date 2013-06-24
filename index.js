"use strict";
var version = require("./package").version;
var server = require("./server");
var distributor = require("./lib/distributor");
var environment = process.env.NODE_ENV || "development";
var seaportConf = {
    host: process.argv[2],
    port: parseInt(process.argv[3], 10)
};

var client = require("rauschen-registry").client;
var config = client(seaportConf.host, seaportConf.port);

config.on("update", function () {
    var domainRestrictor = require("./lib/domain-restrictor")(config.get("data").domains);

    server.use(domainRestrictor);

    var seaport = require("seaport");
    var ports = seaport.connect(seaportConf.host, seaportConf.port);

    distributor(server, ports.register("distributor@" + version));
    console.log("distributor started");

    server.listen(ports.register("receiver@" + version));
    console.log("receiver started");

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
