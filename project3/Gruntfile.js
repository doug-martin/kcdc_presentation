/*global module:false*/
module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-link');

    grunt.registerTask("say_hello", function () {
        require("./api");
        require("./model");
        require("./webapp/app");
    });

};
