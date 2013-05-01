/*global module:false*/
module.exports = function (grunt) {
    var comb = require("comb"),
        patio = require("patio");
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            file: "./index.js",
            options: {
                jshintrc: '.jshintrc'
            }
        },

        it: {
            all: {
                src: 'test/**/*.test.js',
                options: {
                    timeout: 3000, // not fully supported yet
                    reporter: 'dotmatrix'
                }
            }
        }

    });

    // Default task.
    grunt.registerTask('default');
    grunt.loadNpmTasks('grunt-link');

    grunt.registerTask('webapp', 'start webapp', function () {
        process.env.NODE_ENV = process.env.NODE_ENV || "development";

        //this is will not stop automatically as it continuously runs
        var done = this.async(), exitCount = 0;
        require("./webapp/app");
        process.on("SIGINT", function () {
            if (exitCount++ < 1) {
                console.log("\nPress ctrl-c again to exit.");
            } else {
                done();
            }
        });
    });


    grunt.registerTask('services', 'start services', function () {
        process.env.NODE_ENV = process.env.NODE_ENV || "development";

        //this is will not stop automatically as it continuously runs
        var done = this.async(), exitCount = 0;
        require("./services");
        process.on("SIGINT", function () {
            if (exitCount++ < 1) {
                console.log("\nPress ctrl-c again to exit.");
            } else {
                done();
            }
        });
    });

    grunt.registerTask("migrate", function (dir) {
        process.env.NODE_ENV = process.env.NODE_ENV || "development";
        var done = this.async(), opts = {};
        if (dir === "down") {
            opts.target = 0;
        } else if (comb.isNumber(dir)) {
            opts.target = dir;
        }
        patio.camelize = true;
        patio.migrate(require("./config").loadSync().PG_DB, __dirname + "/model/migrations", opts).classic(function (err) {
            if (err) {
                console.log(err.stack || err);
                done(false);
            } else {
                console.log("Done Migrating");
                done();
            }
        });
    });

    grunt.registerTask("blast", function (end) {
        process.env.NODE_ENV = process.env.NODE_ENV || "development";
        var config = require("./config").loadSync(),
            url = "http://" + config.webapp.host + ":" + config.webapp.port + "/math/fibonacci/bus/",
            done = this.async(),
            comb = require("comb"),
            request = comb.wrap(require("request")), requests = [];
        end = end || 25;
        console.log(url);
        for (var i = 1; i <= end; i++) {
            requests.push(request(url + i));
        }
        comb.when(requests).classic(function (err) {
            if (err) {
                console.log(err.stack || err);
                done(false);
            } else {
                console.log("Done Blasting!");
                done();
            }
        });

    });

};
