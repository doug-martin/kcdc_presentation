/*global module:false*/
module.exports = function (grunt) {
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
