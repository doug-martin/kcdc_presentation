var patio = require("patio");

module.exports = {
    up: function (db, done) {
        return db.createTable("fibonacci", function () {
            this.primaryKey("id");
            this.num("int", {allowNull: false});
            this.fib("int", {allowNull: false});
        });
    },

    down: function (db, done) {
        return db.dropTable("fibonacci");
    }
};