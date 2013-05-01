var comb = require("comb"),
    bus = require("kcdc-project5-bus")(),
    config = require("kcdc-project5-config").loadSync(),
    model = require("kcdc-project5-model"),
    Fibonacci = model.Fibonacci,
    cluster = require("cluster"),
    LOGGER = require("kcdc-project5-logger")("kcdc.services");

if (cluster.isMaster && config.services.numberToFork > 1) {
    // Fork workers.
    for (var i = 0, l = config.services.numberToFork; i < l; i++) {
        cluster.fork();
    }
} else {

    // set our process title
    process.title = "kcdc-project5-services";

    //log all uncaught exceptions
    process.on("uncaughtException", function (err) {
        LOGGER.error(err);
    });

    function fibonacci(n) {
        return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
    }

    //listen to the the fibonacci queue
    bus.workerQueue(config.services.fibQueueName).subscribe(comb.wait(model.sync(), function (message) {
        //ensure that we got a number to calculate
        if (message.num) {
            LOGGER.debug("calculating fibonacci of %d", message.num);
            //find or create a new Fibonacci record
            return Fibonacci.findOrCreate({num: message.num}).chain(function (fibModel) {
                if (fibModel.isNew) {
                    //we got a new one so calculate and save the value
                    return fibModel.save({fib: fibonacci(fibModel.num)}).chain(function (fib) {
                        //done calculating!
                        LOGGER.info("calculated fibonacci of %d", fibModel.num);
                    });
                }
            });
        } else {
            //Log an error if we did not get a number
            LOGGER.error("fibonacci: got message without number");
        }
    }));

}
