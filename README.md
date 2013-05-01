# Creating Scalable Node.js Applications

In this presentation all projects build on one another.

## Project1

The `project1` directory contains a node app that demonstrates the usage of linking modules.

### Installation

```
npm install
grunt link
```

The above two commands will install the project and perform the linking of local modules across each submodule.

### About

Using [grunt-link](https://github.com/doug-martin/grunt-link) allows developers to create smaller reusable components and can come in handy if you later decide to open source a module you can just replace out the dependency rather than changing relative paths across your app.

Please take note of each submodules `package.json` which contains a property called `linkDependencies`. This property is where you specify the linked submodules.

`package.json` for the `api` submodule.

```json
{
    "name": "kcdc-project1-api",
    "version": "0.0.0",
    "main": "index.js",
    "repository": "",
    "author": "",
    "linkDependencies": [
        "kcdc-project1-config",
        "kcdc-project1-model"
    ],
    "license": "BSD"
}

```

As you can see the `api` module depends on the `config` and `model` submodules.

## Project2

The `project2` directory contains code that demonstrates using the [gofigure](https://github.com/C2FO/gofigure) `npm` module.

### Installation

This example project builds on `project1` adding a `postinstall` script to the root `package.json` that automatically runs `grunt link`

```
npm install
```

### About

Creating a single module for configuration and using it across your app helps immensly in the managing of configuration files.

This project adds a new `config` module which wraps gofigure providing a standard way for all other modules to load their configurations.

The code for loading the configurations is located in `project2/config/index.js` and the default configuration files are located in `project2/config/configs`

Code from `project2/config/index.js`

```javascript
var path = require("path"),
    gofigure = require("gofigure");

module.exports = exports = gofigure({
    monitor: true,
    locations: [
        //make sure anything in the home directory takes precedenc
        process.env.HOME + "/.kcdc/configs",
        //next is our configs at /kcdc
        path.resolve("/kcdc"),
        //finally load our default configurations
        require.resolve("./configs")
    ]
});

```

In the above code snippet we load configurations from:

 * `process.env.HOME + "/.kcdc/configs"` : This allows developers to override single properties without changing default configs.
 * `path.resolve("/kcdc")` : Next we load configurations from `/kcdc`
 * `require.resolve("./configs")` : Now load our default configs

In our configuration `json` files there are different root keys namely

* `*` : This keys specifies to use this configuration as the default accross all envs
* `development`: Configuration for the development env.
* `production`: Configuration for the production env.
* `test`: Configuration for the test env.

## Project 3

The `project3` directory contains code that demonstrates using [comb logger](http://c2fo.github.io/comb/logging.html).

### Installation

```
npm install
```

### About

In this project we added a new submodule called `logger` which is the wrapper for logging across our app.

The logger module handles setting up and monitoring configuration changes for loggers (in this example we just change the log levels dynamically)

Code from `project3/logger/index.js`

```
"use strict";
var comb = require("comb"),
    logger = comb.logger,
    //get the shared configuration module
    kcdcConfig = require("kcdc-project3-config"),
    config = kcdcConfig.loadSync();

//set up listeners so logging levels change dynamically based on current configuration
kcdcConfig.on("logging.*.level", function (name, level) {
    //get the logger name
    var logName = name.replace(/^(logging\.)|(\.level)$/ig, "");
    //set the new log level
    logger(logName).level = level;
});

//configure our logging
logger.configure(config.logging);
//expose our logger interface
module.exports = comb.logger;

```

In the above code snippet we load the `kcdc-project3-config` modules to configure our logging listen to log level changes.

**Notice** In this file we just directly expose `comb.logger`.

In our other submodules we just load the the `kcdc-porject3-logger` modules and say hello from each module.

To run this example run

```
grunt say_hello
```

You should see something like the following.

```
Douglass-MacBook-Pro-2.local::20::63964::[2013-05-01T13:17:48:211 (CDT)]::kcdc.api::INFO - hello from api!
Douglass-MacBook-Pro-2.local::20::63964::[2013-05-01T13:17:48:216 (CDT)]::kcdc.api::INFO - hello from model!
Douglass-MacBook-Pro-2.local::20::63964::[2013-05-01T13:17:48:219 (CDT)]::kcdc.api::INFO - hello from webapp!
```

**Note** if you get an error you may need to creating the logging directory.

```
sudo mkdir /var/log/kcdc
sudo chown {USER} /var/log/kcdc
```

## Project 4

The `project4` directory contains code the puts the previous examples together to create a simple webapp that uses the [werker](https://github.com/C2FO/werker) modules to fork child processes.

### Installation

```
npm install
```

### About

In this project we add some logic to our `api`, and `webapp` modules.

Code from `project4/api/math/routes.js`

```javascript
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
        "/fibonacci/cluster/:num",
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
```

In the above code snippet we:

  * Create a worker pool
  * Setup our routes


Code from `project4/api/math/workers.js`

```
var werker = require("werker"),
    LOGGER = require("kcdc-project4-logger")("kcdc.api.math.workers"),
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
```

In the above code snippet we set up our worker and the expose a `fibonacci` method.

**NOTE** how in `project4/api/math/routes.js` we can just call `fibonacci` like a normal javascript method.

To run this example `grunt webapp` from the project4 directory.

Goto
 * [http://localhost:3000/math/fibonacci/werker/20](http://localhost:3000/math/fibonacci/werker/20)
 * [http://localhost:3000/math/fibonacci/cluster/20](http://localhost:3000/math/fibonacci/cluster/20)
 * [http://localhost:3000/math/](http://localhost:3000/math)

#### Benchmarks and Notes

I have included [jmeter](http://jmeter.apache.org/download_jmeter.cgi) test files to show the performance of the clustered vs. worker process performance.

When running them you will see the performance is similar.

However there is a catch!

In the clustered version if you run the benchmark and try to access the `/math` resource you'll notice that the response time is delayed, because all of your servers are blocking calculating the fibonacci number.

In the worker process version, because we delegated the calculation to a worker process, the `/math` resource is not blocked and can respond in a timely manner!

You may want to play with the configuration values you can either change the values in the default configs directory `/project4/config/configs/webapp.json` and `/project4/config/configs/workers.json`, to see how chaing the clustering, max pool size changes performance.

**Note** Because we set up our config module to read from user home also you can set up you config in `~/.kcdc/configs/config.json`

Example dev config

```json
{
 	"development":{
        	"webapp": {
            	"cluster": 4
        	},
        	"workers": {
            	"ttl": 10000,
            	"max": 2
        }
    }
}
```

## Project5

The `project5` directory contains a project that publishes messages to a worker queue that can be processed at a later time.

### Installation

```
npm install
```

### About

This project leverages a module named [hare](https://github.com/c2fo/hare), which is a wrapper around the [amqp](https://github.com/postwait/node-amqp) module making it easier to set up worker queues in node.

In this project the following modules were added.

* `bus` : this is the wrapper our `hare` that configures `amqp` for all of our modules.
* `services` : this module creates our `amqp` listeners to process messages published by our modules.

Code snippet from `project5/services/index.js`

```javascript
//listen to the the fibonacci queue
bus.workerQueue(config.services.fibQueueName).subscribe(comb.wait(model.sync(), function (message) {
    //ensure that we got a number to calculate
    if (message.num) {
        LOGGER.debug("calculating fibonacci of %d", message.num);x
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
```

In the above code we set up a listener for the fibonacci worker queue. In the subscribe callback we find or create a new Fibonacci record in the database. If it does not exist we calculate the new value and save it.


In the math api we added two new routes.

* `/math/fibonacci/bus/:num` : This route published the number to a worker queue to be calculated at a later time.
* `/math/fibonacci/calculated` : This route returns all calculated fibonacci values.

New routes code.

```javascript
//get all calculated fibonacci values.
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

```

So in the above example the `/math/fibonacci/bus/:num` just publishes the number to be calculated at a later time, and the `/math/fibonacci/calculated` route can be used to look up known values.


To run this example you will need multiple terminal sessions.

In the first terminal.

```
grunt webapp
```

In another terminal

```
grunt services
```

To make a bunch of requests to the webapp you can use the `grunt blast` task which will send off a bunch of requests to the webapp. Once the blast task is done you can visit [http://localhost:3000/math/fibonacci/calculated](http://localhost:3000/math/fibonacci/calculated) to see values that got calculated.
