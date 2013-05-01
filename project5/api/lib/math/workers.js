var werker = require("werker"),
    LOGGER = require("kcdc-project5-logger")("kcdc.api.math.workers"),
    fibonacci = require("./util").fibonacci;

module.exports = werker.worker()
    //The title this process should have
    .title("kcdc-workers")
    //expose a fibonacci method to the parent process
    .method("fibonacci", function (n) {
        LOGGER.debug("Calculating fibonacci of %d", n);
        return fibonacci(n);
    })
    //start listening
    .start();