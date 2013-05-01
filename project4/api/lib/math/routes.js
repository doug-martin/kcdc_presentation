module.exports = function (app) {
    var werker = require("werker"),
        config = require("kcdc-project4-config").loadSync().workers,
        LOGGER = require("kcdc-project4-logger")("kcdc.api.math"),
        fibonacci = require("./util").fibonacci;

    //create the worker pool
    var pool = werker.pool(require.resolve("./workers.js"))
        //set the max number of workers for the pool
        .max(config.max)
        //set the time to live on each worker
        .ttl(config.ttl);

    //routes describing actions available under the math resource
    app.get("/math", function (req, res) {
        LOGGER.debug("getting math actions");
        res.send({actions: [
            "/fibonacci/werker/:num",
            "/fibonacci/cluster/:num"
        ]})
    });

    //a route that uses a worker process to calculate fiboncacci of a number
    app.get("/math/fibonacci/werker/:num", function (req, res) {
        LOGGER.debug("attempting to calculate fibonacci of %d", req.params.num);
        //get a worker an calculate the fibonacci value
        return  pool.worker().fibonacci(req.params.num, function (err, fib) {
            if (err) {
                //Handle the error case
                res.error(res);
            } else {
                //Send the result back to the client
                res.send({fib: fib});
            }
        });
    });

    //a route that calculates fiboncacci of a number in the same process
    app.get("/math/fibonacci/cluster/:num", function (req, res) {
        LOGGER.debug("attempting to calculate fibonacci of %d", req.params.num);
        //just calculate the fibonacci number
        res.send({fib: fibonacci(req.params.num)});
    });
}