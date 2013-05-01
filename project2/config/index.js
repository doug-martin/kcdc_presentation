var path = require("path"),
    gofigure = require("gofigure");

module.exports = exports = gofigure({
    //monitor changes that occur in configuration files so we can change them without restarting our app
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
