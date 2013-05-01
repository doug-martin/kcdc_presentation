"use strict";
/*jshint unused: false*/
var cluster = require("cluster"),
    express = require('express'),
    logger = require("kcdc-project5-logger"),
    config = require('kcdc-project5-config').loadSync(),
    api = require("kcdc-project5-api");

if (cluster.isMaster && config.webapp.cluster > 1) {
    // Fork workers.
    for (var i = 0, l = config.webapp.cluster; i < l; i++) {
        cluster.fork();
    }
} else {

    process.title = "kcdc-project5-webapp";
    var LOGGER = logger("kcdc.webapp");

    process.on("uncaughtException", function (err) {
        LOGGER.error(err);
    });


    var app = express();
    // Configuration
    app.configure(function () {
        app.set('port', config.webapp.port);
        app.use(express.compress());
        app.use(express.cookieParser());
        app.use(express.bodyParser());

    });

    app.configure('development', function () {
        Error.stackTraceLimit = Infinity;
    });

    api.route(app);

    app.listen(config.webapp.port, function () {
        LOGGER.info("Express server listening on port %d in %s mode", app.settings.port, app.settings.env);
    });

}
