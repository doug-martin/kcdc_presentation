var path = require("path"),
    gofigure = require("gofigure");

var CONFIG_LOCATIONS = [process.env.HOME + "/.kcdc/configs", path.resolve("/kcdc"), path.resolve(__dirname, "./configs")];

module.exports = exports = gofigure({monitor: true, locations: CONFIG_LOCATIONS});
