"use strict";
var hare = require("hare"),
    amqpConfig = require("kcdc-project5-config").loadSync().amqp,
    connectionOpts = amqpConfig.connect,
    subscribeOptions = amqpConfig.subscribe || {};

//initialize hare with default queue options
hare.queueOptions(subscribeOptions);
//initialize hare with default connection options
hare.connectionOptions(connectionOpts);

//expose
module.exports = function () {
    return hare.apply(hare, arguments);
};
