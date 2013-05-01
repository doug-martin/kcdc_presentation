module.exports = function (app) {
    var comb = require("comb"),
        werker = require("werker"),
        config = require("kcdc-project5-config").loadSync(),
        LOGGER = require("kcdc-project5-logger")("kcdc.api.math"),
        model = require("kcdc-project5-model"),
        Fibonacci = model.Fibonacci,
        fibonacci = require("./util").fibonacci,
        bus = require("kcdc-project5-bus")(),
        fibQueue = bus.workerQueue(config.services.fibQueueName);

    //create the worker pool
    var pool = werker.pool(require.resolve("./workers.js"))
        //set the max number of workers for the pool
        .max(config.workers.max)
        //set the time to live on each worker
        .ttl(config.workers.ttl);

    //routes describing actions available under the math resource
    app.get("/math", function (req, res) {
        LOGGER.debug("getting math actions");
        res.send({actions: [
            "/fibonacci/calculated",
            "/fibonacci/werker/:num",
            "/fibonacci/bus/:num",
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
                res.error(err);
            } else {
                //Send the result back to the client
                res.send({fib: fib});
            }
        });
    });

    app.get("/math/fibonacci/calculated", comb.wait(model.sync(), function (req, res) {
        LOGGER.debug("getting calculated fibonacci values");
        //Get all fibonacci records
        Fibonacci.order("num").select("num", "fib").naked().all(null, function (err, fibs) {
            if (err) {
                //oops there was a error
                res.error(err);
            } else {
                //send the records back to the client
                res.send(fibs);
            }
        });
    }));

    //a route that uses a worker process to calculate fiboncacci of a number
    app.get("/math/fibonacci/bus/:num", function (req, res) {
        LOGGER.debug("attempting to calculate fibonacci of %d", req.params.num);
        //published the value to the queue
        fibQueue.publish({num: req.params.num});
        //send the response
        res.send({calculating: true});
    });

    //a route that calculates fiboncacci of a number in the same process
    app.get("/math/fibonacci/cluster/:num", function (req, res) {
        LOGGER.debug("attempting to calculate fibonacci of %d", req.params.num);
        //just calculate the fibonacci number
        res.send({fib: fibonacci(req.params.num)});
    });
}