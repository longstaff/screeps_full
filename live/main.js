const baseColony = require('base.colony');

module.exports.loop = function () {
    Object.values(Game.spawns).forEach((colony => {
        baseColony.run(colony);
    }))
}