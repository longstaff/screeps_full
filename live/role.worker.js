const Constants = require('const');
const creepUtil = require('util.creep');

const TARGET_REFRESH_TICKS = 10;

const giveEnergy = (creep, origin) => {
    let target = null;
    
    //Store the target it memory to save searching the room every tick
    if (creep.memory.target && creep.memory.targetRefresh < TARGET_REFRESH_TICKS) {
        target = Game.getObjectById(creep.memory.target);
        creep.targetRefresh ++;
    }
    //If nothing stored or refresh hit, look for something new
    if (!target) {
        //find the closest miner to give to.
        var sources = origin.room.find(FIND_MY_CREEPS, {
            filter: function(i) {
                return (i.memory.role === Constants.CREEP_WORKER_MINER || i.memory.role === Constants.CREEP_WORKER) && i.carry.energy < i.carryCapacity;
            }
        });
        target = sources.length ? sources[0] : null;
        creep.memory.target = target ? target.id : null;
        creep.memory.targetRefresh = 0;
    }
    
    if (target){
        const resp = creep.transfer(target, RESOURCE_ENERGY);
        if (resp === ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {visualizePathStyle: {stroke: '#ccc'}});
        } else if (resp === ERR_FULL) {
            creep.memory.target = null;
        }
    }
    else {
        if (creep.memory.role === Constants.CREEP_WORKER) creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}})
        else creepUtil.moveToStandby(creep, origin);
    }
}

const buildStructure = (creep, origin, buildSites) => {
    var result = creep.build(buildSites[0]);

    if (result === ERR_NOT_IN_RANGE || result === ERR_NOT_ENOUGH_ENERGY) {
        creep.moveTo(buildSites[0]);
    }
//    if(result === -14){
//        origin.memory.notYet.push(buildSites[0].id);
//    }
}

const upgradeController = (creep, origin) => {
    if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
    }
}
const getEnergy = (creep, origin, currentState) => {
    let target = null;

    //Test if there is a source, should be link
    if (origin.source) target = Game.getObjectById(origin.source);

    // Else look for a storage element in the room that has space
    if (!target) {
        const targets = origin.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_STORAGE || structure.structureType === STRUCTURE_SPAWN) &&
                    structure.energy > 1;
            }
        });       
        target = targets.length ? targets[0] : null;
    }

    if (!target) {
        if (creep.memory.role === Constants.CREEP_WORKER) creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}})
        else creepUtil.moveToStandby(creep, origin);
    }
    else {
        creep.moveTo(target);
        creep.withdraw(target, RESOURCE_ENERGY);
    }
}
const returnEnergy = (creep, origin) => {
    const targets = origin.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_STORAGE || structure.structureType === STRUCTURE_SPAWN) &&
                structure.energy < structure.energyCapacity;
        }
    });       
    const target = targets.length ? targets[0] : null;

    if (!target){
        if (creep.memory.role === Constants.CREEP_WORKER) creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}})
        else creepUtil.moveToStandby(creep, origin);
    }
    else { //Put it somewhere
        const resp = creep.transfer(target, RESOURCE_ENERGY);
        if (resp === ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
        }
    } 
}

const prerun = (origin, creep, currentState, buildSites) => {
    //Everyone takes what they can!
    const target = buildSites.length ? buildSites[0] : creep.room.controller;
    if(creep.memory.role !== Constants.CREEP_WORKER_CARRY && creep.carry.energy === 0){
        creepUtil.stealFrom(creep, target, [Constants.CREEP_HARVESTER, Constants.CREEP_HARVESTER_CARRY, Constants.CREEP_WORKER, Constants.CREEP_WORKER_CARRY], Constants.CREEP_WORKER_CARRY);
    }
}

const run = (origin, creep, currentState, buildSites) => {
    var target = buildSites.length > 0 ? buildSites[0] : origin.room.controller;

    if(creep.memory.role !== Constants.CREEP_WORKER_MINER && creep.carry.energy === 0){
        creep.memory.task = "recharge";
    }
    else if(buildSites.length && origin.room.controller.ticksToDowngrade > 1000){
        creep.memory.task = "build";
    }
    else if(creep.carry.energy === creep.carryCapacity){
        creep.memory.task = "store";
    }


    else if (creep.memory.role === Constants.CREEP_WORKER_CARRY && currentState === Constants.STATE_DEFENCE || currentState === Constants.STATE_HARVEST) {
        returnEnergy(creep, origin);
    }
    if (creep.memory.role === Constants.CREEP_WORKER_CARRY && (creep.memory.task === "build" || creep.memory.task === "store")) {
        giveEnergy(creep, origin);
    }
    else if (creep.memory.task === "build") {
        buildStructure(creep, origin, buildSites);
    }
    else if (creep.memory.task === "store") {
        upgradeController(creep, origin);
    }
    else if(creep.memory.role !== Constants.CREEP_WORKER_MINER) {
        getEnergy(creep, origin);
    }
}

const postrun = (origin, creep, currentState, buildSites) => {}

module.exports = {
    prerun,
    run,
    postrun,
}