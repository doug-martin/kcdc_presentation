"use strict";
var kcdcConfig = require("kcdc-project5-config"),
    logger = require("kcdc-project5-logger"),
    LOGGER = logger("kcdc.model"),
    patio = require("patio"),
    comb = require("comb"),
    when = comb.when,
    config = kcdcConfig.loadSync(),
    connected = false;

patio.camelize = true;
module.exports = {
    Fibonacci: require("./fibonacci"),

    sync: (function () {
        var syncedPromise = null;
        return function () {
            if (!connected) {
                this.DB = patio.connect(config.PG_DB);
                connected = true;
            }
            if (!syncedPromise) {
                LOGGER.debug("connecting");
                syncedPromise = patio.syncModels.apply(patio, arguments);
            }
            return syncedPromise;
        };
    }()),

    disconnect: function () {
        if (connected) {
            connected = false;
            this.DB = null;
            LOGGER.debug("disconnecting");
            return patio.disconnect();
        } else {
            return new comb.Promise().callback();
        }
    }
};

