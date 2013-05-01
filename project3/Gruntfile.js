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

    grunt.registerTask("say_hello", function () {
        require("./api");
        require("./model");
        require("./webapp/app");
    });

};
