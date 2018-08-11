//var Defence = require('defenceCreep');
//var Offence = require('offenceCreep');
var Harvester = require('role.harvester');
var Worker = require('role.worker');
const Constants = require('const');

const creepUtil = util.creep;

const StructureMaker = require('util.makestructure');
const CreepMaker = require('util.makecreep');

const MAX_CREEPS = 13;

const init = (spawn) => {
    if (!spawn.memory.creeps) spawn.memory.creeps = [];
    if (!spawn.memory.controlLevel) spawn.memory.controlLevel = 0;
//    if (!spawn.memory.buildingSites) spawn.memory.buildingSites = [];
//    if (!spawn.memory.extensions) spawn.memory.extensions = 0;
//    if (!spawn.memory.notYet) spawn.memory.notYet = [];
}

const checkCreepStatus = (creeps) => {
    return creeps.map(creep => {
        var creepObj = Game.creeps[creep.name];
        return creepUtil.isStillAlive(creepObj, creep);
    }).filter(creep => creep !== null);
}
const countCreeps = (creeps) => {
    const tally = {
        defenceCreeps: 0,
        offenceCreeps: 0,
        workerCreeps: 0,
        workerMinerCreeps: 0,
        workerCarryCreeps: 0,
        harvesterCreeps: 0,
        harvesterMinerCreeps: 0,
        harvesterCarryCreeps: 0,
        totalCreeps: 0,
    };

    creeps.forEach(creep => {
        var creepObj = Game.creeps[creep.name];
        switch (creepObj.memory.role) {
            case Constants.CREEP_DEFENCE:
                tally.defenceCreeps ++;
                tally.totalCreeps ++;
                break;
            case Constants.CREEP_OFFENCE:
                tally.offenceCreeps ++;
                tally.totalCreeps ++;
                break;
            case Constants.CREEP_WORKER:
                tally.workerCreeps ++;
                tally.totalCreeps ++;
                break;
            case Constants.CREEP_WORKER_MINER:
                tally.workerMinerCreeps ++;
                tally.totalCreeps ++;
                break;
            case Constants.CREEP_WORKER_CARRY:
                tally.workerCarryCreeps ++;
                tally.totalCreeps ++;
                break;
            case Constants.CREEP_HARVESTER:
                tally.harvesterCreeps ++;
                tally.totalCreeps ++;
                break;
            case Constants.CREEP_HARVESTER_MINER:
                tally.harvesterMinerCreeps ++;
                tally.totalCreeps ++;
                break;
            case Constants.CREEP_HARVESTER_CARRY:
                tally.harvesterCarryCreeps ++;
                tally.totalCreeps ++;
                break;
        }
    })

    return tally;
}

const generateBuildSites = (spawn) => {
    var maxExtensions = Math.max(10, (spawn.room.controller.level - 1)*5);

    if (spawn.room.controller.level > 1 && spawn.room.find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_EXTENSION }
    }).length + spawn.room.find(FIND_CONSTRUCTION_SITES, {
        filter: { structureType: STRUCTURE_EXTENSION }
    }).length <= maxExtensions){
        StructureMaker.createNewExtension(spawn);
    }

    if(spawn.room.controller.level > 2 && spawn.memory.controlLevel !== spawn.room.controller.level){
        StructureMaker.createRoads(spawn);
    }
    if(spawn.room.controller.level > 2 && spawn.memory.controlLevel !== spawn.room.controller.level){
//        StructureMaker.createRoomDefenses(spawn.room);
    }

    if(spawn.memory.controlLevel !== spawn.room.controller.level){
        spawn.memory.controlLevel = spawn.room.controller.level;
//      spawn.memory.notYet = [];
    }
}
getBuildSites = spawn => spawn.room.find(FIND_CONSTRUCTION_SITES, 
    {
        my: true
    }
)

const getState = (creeps, buildSites) => {
    //TODO: set states
    if(creeps.harvesterCreeps + creeps.harvesterCarryCreeps + creeps.harvesterMinerCreeps < 5){
        return Constants.STATE_HARVEST;
    }
 //   else if(creeps.defenceCreeps < 5){
 //       return Constants.STATE_DEFENCE;
 //   }
    else if(buildSites.length > 0){
        return Constants.STATE_EXPAND;
    }
    else if(spawn.room.controller && spawn.room.controller.level < 3){
        return Constants.STATE_STORE;
    }
    else{
        return Constants.STATE_SPREAD;
    }
}

const generateNewCreep = (spawn, currentState, creeps) {
    if(currentState === Constants.CREEP_DEFENCE || totalCreeps <= MAX_CREEPS){
        var extensionCount = (harvesterCreeps === 0 && harvesterMinerCreeps > 1 || harvesterCreeps > 1) ? spawn.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_EXTENSION }
        }).length : 0;

        switch(currentState){
            case Constants.STATE_HARVEST:
                if(extensionCount === 0 && harvesterCreeps < 1){
                    //Generic ones to start you off
                    return [...creeps, CreepMaker.makeHarvesterCreep(spawn, extensionCount)];
                }
                else if((extensionCount === 0 && harvesterMinerCreeps < 2) || (extensionCount > 0 && harvesterMinerCreeps + harvesterMinerCreeps < 3)){
                    //A couple of miners
                    return [...creeps, CreepMaker.makeHarvesterMinerCreep(spawn, extensionCount)];
                }
                else{
                    //The rest are carrying energy
                    return [...creeps, CreepMaker.makeHarvesterCarryCreep(spawn, extensionCount)];
                }
                break;
            case Constants.STATE_EXPAND:
                if(spawn.room.controller){
                    return [...creeps, CreepMaker.makeWorkerCreep(spawn, extensionCount)];
                }
                else return creeps;
                break;
            case Constants.STATE_SPREAD:
            case Constants.STATE_STORE:
                if(extensionCount === 0 && workerCreeps < 2){
                    //Generic ones to start you off
                    return [...creeps, CreepMaker.makeWorkerCreep(spawn, extensionCount)];
                }
                else if((extensionCount === 0 && workerMinerCreeps < 2) || (extensionCount > 0 && workerMinerCreeps < 3)){
                    //A couple of miners
                    return [...creeps, CreepMaker.makeWorkerMinerCreep(spawn, extensionCount)];
                }
                else{
                    //The rest are carrying energy
                    return [...creeps, CreepMaker.makeWorkerCarryCreep(spawn, extensionCount)];
                }
                break;
//            case Constants.STATE_DEFENCE:
//                if(defenceCreeps % 2 === 0){
//                    return [...creeps, CreepMaker.makeDefenceRangeCreep(spawn, extensionCount)];
//                }
//                else{
//                    return [...creeps, CreepMaker.makeDefenceShortCreep(spawn, extensionCount)];
//                }
//                break;
            default:
                return creeps;
        }
    }
}

const run = (spawn) => {
    init(spawn);
    generateBuildSites(spawn);

    spawn.memory.creeps = checkCreepStatus(spawn.memory.creeps);
    const creeps = countCreeps(spawn);

    var buildSites = getBuildSites(spawn);

    const currentState === getState(creeps, buildSites);
    spawn.memory.creeps = generateNewCreep(spawn, currentState);

    //Tell creeps to do something
    spawn.memory.creeps.forEach(creep => {
        var creepObj = Game.creeps[creep.name];
        if (!creepObj) return;

        /*
        if(creepObj.memory.role === Constants.CREEP_DEFENCE) {
            Defence(spawn, creepObj);
        }
        if(creepObj.memory.role === Constants.CREEP_OFFENCE) {
            Offence(spawn, spawn, creepObj, currentState, true);
        }
        */

        if(creepObj.memory.role === Constants.CREEP_HARVESTER ||
            creepObj.memory.role === Constants.CREEP_HARVESTER_MINER ||
            creepObj.memory.role === Constants.CREEP_HARVESTER_CARRY) {
            Harvester.run(spawn, creepObj);
        }

        if(creepObj.memory.role === Constants.CREEP_WORKER ||
            creepObj.memory.role === Constants.CREEP_WORKER_MINER) {
            if((currentState === Constants.STATE_DEFENCE || currentState === Constants.STATE_HARVEST) && harvesterCreeps + harvesterMinerCreeps < 3){
                Harvester.run(spawn, creepObj);
            }
            else{
                Worker.run(spawn, creepObj, currentState, buildSites);
            }
        }
        if(creepObj.memory.role === Constants.CREEP_WORKER_CARRY) {
            Worker.run(spawn, creepObj, currentState, buildSites);
        }

    })
}

module.exports = {
    run
}