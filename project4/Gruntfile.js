/*global module:false*/
module.exports = function (grunt) {
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

};
