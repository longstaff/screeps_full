const Constants = require('const');
const creepUtil = require('util.creep');

const TARGET_REFRESH_TICKS = 10;

const getDepositTarget = (creep, origin) => {
    let target = null;

    // Sink for energy, should be a link structure or similar
    if (origin.memory.sink) target = Game.getObjectById(origin.memory.sink);

    // Else look for a storage element in the room that has space
    if (!target) {
        const targets = origin.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_STORAGE || structure.structureType === STRUCTURE_SPAWN) &&
                    structure.energy < structure.energyCapacity;
            }
        });       
        target = targets.length ? targets[0] : null; 
    }

    return target;
}
const depositEnergy = (creep, origin) => {
    let target = null;

    //Store the target it memory to save searching the room every tick
    if (creep.memory.target && creep.memory.targetRefresh < TARGET_REFRESH_TICKS) {
        target = Game.getObjectById(creep.memory.target);
        creep.memory.targetRefresh ++;
    }
    //If nothing stored or refresh hit, look for something new
    if (!target) {
        target = getDepositTarget(creep, origin);
        creep.memory.target = target ? target.id : null;
        creep.memory.targetRefresh = 0;
    }

    //If nothing, wait for something to be free
    if (!target){
        creepUtil.moveToStandby(creep, origin);
    }
    else { //Put it somewhere
        const resp = creep.transfer(target, RESOURCE_ENERGY);
        if (resp === ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
        } else if (resp === ERR_FULL) {
            creep.memory.target = null;
        }
    }
}

const getEnergyTarget = (origin) => {
    let target = null;

    if (!origin.memory.source) {
        var sources = origin.pos.findInRange(FIND_SOURCES, 2);
        origin.memory.source = sources[0].id;
    }
    
    return Game.getObjectById(origin.memory.source);
}
const getEnergyScreep = (creep, origin) => {
    let target;
    
    var closest = getEnergyTarget(origin).pos.findInRange(FIND_MY_CREEPS, 2, {
        filter: function(i) {
            return (i.memory.role === Constants.CREEP_HARVESTER_MINER || i.memory.role === Constants.CREEP_HARVESTER);
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

        if (most) target = most;
    }
    
    return target;
}

const getEnergy = (creep, origin) => {
    let target = null;
    
    //Store static target in memory to save searching the room every tick
    if (creep.memory.target && creep.memory.targetRefresh < TARGET_REFRESH_TICKS) {
        target = Game.getObjectById(creep.memory.target);
        creep.targetRefresh ++;
    }
    //If nothing stored or refresh hit, look for something new
    if (!target) {
        if (creep.memory.role === Constants.CREEP_HARVESTER_CARRY) target = getEnergyScreep(creep, origin);
        else target = getEnergyTarget(origin);

        creep.memory.target = target ? target.id : null;
        creep.memory.targetRefresh = 0;
    }

    //If nothing, wait for something to be free
    if (!target) {
        creepUtil.moveToStandby(creep, origin);
    }
    else {
        //Get from target
        let resp;
    
        if (creep.memory.role !== Constants.CREEP_HARVESTER_CARRY) {
            resp = creep.harvest(target);
        }

        if (resp === ERR_NOT_IN_RANGE || creep.memory.role === Constants.CREEP_HARVESTER_CARRY) {
            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
        }
    }
}

const prerun = (origin, creep) => {
    //Everyone takes what they can!
    if (creep.memory.role !== Constants.CREEP_HARVESTER_MINER) {
        const sink = getDepositTarget(creep, origin);
        creepUtil.stealFrom(creep, sink ? sink : origin, [Constants.CREEP_HARVESTER, Constants.CREEP_HARVESTER_CARRY, Constants.CREEP_HARVESTER_MINER], Constants.CREEP_HARVESTER_CARRY);
    }
}
const run = (origin, creep) => {
    if (creep.carry.energy === 0) {
        if (creep.memory.action !=='HARVEST') {
            creep.memory.action = 'HARVEST';
            creep.memory.target = null;
        }
    } else if (creep.carry.energy === creep.carryCapacity && creep.memory.role !== Constants.CREEP_HARVESTER_MINER) {
        if (creep.memory.action !=='DEPOSIT') {
            creep.memory.action = 'DEPOSIT';
            creep.memory.target = null;
        }
    }

    if (creep.memory.action === 'DEPOSIT') {
        depositEnergy(creep, origin);
    }
    else {
        getEnergy(creep, origin);
    }
}
const postrun = (origin, creep) => {}

module.exports = {
    prerun,
    run,
    postrun
}