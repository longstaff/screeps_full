const baseCore = require('base.core');

module.exports.loop = function () {
    Object.values(Game.spawns).forEach((core => {
        baseCore.run(core);
    }))
}