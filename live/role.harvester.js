const Constants = require('const');
const creepUtil = require('util.creep');

const depositEnergy = (creep, spawn) => {
    const targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                structure.energy < structure.energyCapacity;
        }
    });
    
    if(targets.length === 0){
        creepUtil.moveToStandby(creep, spawn);
    }
    else{
        if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
        }
    }
}

const run = (spawn, creepObj) => {
    //Get energy?
    if(creepObj.carry.energy < creepObj.energyCapacity) {

        let steal = false;
        //If you are a miner, dont steal
        if (creepObj.memory.job !== Constants.CREEP_HARVESTER_MINER) {
            steal = creepUtil.stealFrom(creepObj, target, [Constants.CREEP_HARVESTER, Constants.CREEP_HARVESTER_CARRY, Constants.CREEP_HARVESTER_MINER], Constants.CREEP_HARVESTER_CARRY);
        }
        
        if(!steal || creepObj.carry.energy < creepObj.energyCapacity){
            if(creepObj.memory.job === Constants.CREEP_HARVESTER_CARRY){
                //If a carryer, find the closest miner to steal from.
                var sources = spawn.pos.findInRange(FIND_SOURCES, 10);
                var closest = sources[0].pos.findInRange(FIND_MY_CREEPS, 2, {
                    filter: function(i) {
                        return (i.memory.job === Constants.CREEP_HARVESTER_MINER || i.memory.job === Constants.CREEP_HARVESTER);
                    }
                });
                
                if (closest.length) {
                    var most;
                    var mostEn = 0;
                    for (var close in closest) {
                        if (closest[close].carry.energy > mostEn) {
                            mostEn = closest[close].carry.energy > mostEn;
                            most = closest[close];
                        }
                    }
                    
                    if(most){
                        creepObj.moveTo(most);
                        most.transfer(creepObj, RESOURCE_ENERGY);
                    } else{
                        creepUtil.moveToStandby(creep, spawn);
                    }
                } else {
                    creepUtil.moveToStandby(creep, spawn);
                }
            } else {
                //Else harvest if you can.
                var sources = spawn.pos.findInRange(FIND_SOURCES, 10);
                creepObj.moveTo(sources[0]);
                creepObj.harvest(sources[0]);
            }
        } else {
            //If you are a miner, wait for someone to take the energy from you.
            if(creepObj.memory.job !== Constants.CREEP_HARVESTER_MINER){
                depositEnergy(creepObj, spawn)
            }
        }
    } else {
        //If you are a miner, wait for someone to take the energy from you.
        if(creepObj.memory.job !== Constants.CREEP_HARVESTER_MINER){
            depositEnergy(creepObj, spawn
        }
    }
}

module.exports = {
    run
}