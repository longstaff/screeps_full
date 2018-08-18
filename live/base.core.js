const Harvester = require('role.harvester');
const Constants = require('const');

const Colony = require('base.colony');

const creepUtil = require('util.creep');

const StructureMaker = require('util.makestructure');
const CreepMaker = require('util.makecreep');

const MAX_CREEPS = 8;

const init = (spawn) => {
    if (!spawn.memory.creeps) spawn.memory.creeps = [];
    if (!spawn.memory.controlLevel) spawn.memory.controlLevel = 0;
    if (!spawn.memory.colonies) {
        const sources = origin.room.find(FIND_SOURCES);
        const sorted = sources
            .map(source => ({
                source: source.id,
                range: spawn.getRangeTo(source)
            }))
            .sort((a,b) => a.range - b.range)
            .map(range => range.source);

        spawn.memory.colonies = sorted.map((source, ind) => spawn.room.createFlag(source.pos, `${source.room.name} colony ${ind}`)
    }
}

const runColonies = (spawn, extensionCount) => {
    const creepMaker = {
        makeHarvesterCreep: CreepMaker.makeHarvesterCreep.bind(this, spawn, extensionCount),
        makeHarvesterMinerCreep: CreepMaker.makeHarvesterMinerCreep.bind(this, spawn, extensionCount),
        makeHarvesterCarryCreep: CreepMaker.makeHarvesterCarryCreep.bind(this, spawn, extensionCount),
    }
    const contLevel = spawn.room.controller.level;

    const output = spawn.memory.colonies.map(flagName => {
        Colony(Game.flags[flagName], creepMaker, extensionCount, contLevel);
    })

    return output.every(resp => resp === Constants.STATE_EXPAND) ? STATE_EXPAND : STATE_BUILD
}

const generateBuildSites = (spawn) => {
    const maxExtensions = Math.max(10, (spawn.room.controller.level - 1)*5);

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
const getBuildSites = spawn => spawn.room.find(FIND_CONSTRUCTION_SITES, 
    {
        my: true
    }
)

const getState = (spawn, creeps, buildSites, outpostState) => {
    if(outpostState === Constants.STATE_BUILD){
        return Constants.STATE_HARVEST;
    }
 //   else if(creeps.defenceCreeps < 5){
 //       return Constants.STATE_DEFENCE;
 //   }
    else if(buildSites.length > 0){
        return Constants.STATE_EXPAND;
    }
    //else if(spawn.room.controller && spawn.room.controller.level < 3){
        return Constants.STATE_STORE;
    //}
    //else{
    //    return Constants.STATE_SPREAD;
    //}
}

const generateNewCreep = (spawn, currentState, creeps, creepsList, extensionCount) => {
    
    if(currentState === Constants.CREEP_DEFENCE || creeps.totalCreeps <= MAX_CREEPS){
                    
        switch(currentState){
            case Constants.STATE_EXPAND:
                if(spawn.room.controller){
                    const newCreep = CreepMaker.makeWorkerCreep(spawn, extensionCount);
                    return newCreep ? creepsList.concat([newCreep]) : creepsList;
                }
                else return creepsList;
            case Constants.STATE_SPREAD:
            case Constants.STATE_STORE:
                if(extensionCount === 0 && creeps.workerCreeps < 2){
                    //Generic ones to start you off
                    const newCreep = CreepMaker.makeWorkerCreep(spawn, extensionCount);
                    return newCreep ? creepsList.concat([newCreep]) : creepsList;
                }
                else if((extensionCount === 0 && creeps.workerMinerCreeps < 2) || (extensionCount > 0 && creeps.workerMinerCreeps < 3)){
                    //A couple of miners
                    const newCreep = CreepMaker.makeWorkerMinerCreep(spawn, extensionCount);
                    return newCreep ? creepsList.concat([newCreep]) : creepsList;
                }
                else{
                    //The rest are carrying energy
                    const newCreep = CreepMaker.makeWorkerCarryCreep(spawn, extensionCount);
                    return newCreep ? creepsList.concat([newCreep]) : creepsList;
                }
//            case Constants.STATE_DEFENCE:
//                if(defenceCreeps % 2 === 0){
//                    const newCreep = CreepMaker.makeDefenceRangeCreep(spawn, extensionCount);
//                    return newCreep ? creepsList.concat([newCreep]) : creepsList;
//                }
//                else{
//                    const newCreep = CreepMaker.makeDefenceShortCreep(spawn, extensionCount);
//                    return newCreep ? creepsList.concat([newCreep]) : creepsList;
//                }
            case Constants.STATE_HARVEST:
            default:
                return creepsList;
        }
    }
    return creepsList;
}

const run = (spawn) => {
    init(spawn);

    const extensionCount = spawn.room.find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_EXTENSION }
    }).length;

    const outpostState = runColonies(spawn, extensionCount);
    generateBuildSites(spawn);
    
    spawn.memory.creeps = checkCreepStatus(spawn.memory.creeps);
    const creeps = countCreeps(spawn.memory.creeps);
    
    var buildSites = getBuildSites(spawn);

    const currentState = getState(spawn, creeps, buildSites, outpostState);
    spawn.memory.creeps = generateNewCreep(spawn, currentState, creeps, spawn.memory.creeps, extensionCount);

    const allCreeps = spawn.memory.creeps.map(creep => {
        var creepObj = Game.creeps[creep.name];
        return creepObj ? creepObj : null;
    }).filter(creep => creep !== null);

    allCreeps.forEach(creepObj => {
        if(creepObj.memory.role === Constants.CREEP_WORKER ||
            creepObj.memory.role === Constants.CREEP_WORKER_MINER ||
            creepObj.memory.role === Constants.CREEP_WORKER_CARRY) {
            Worker.prerun(spawn, creepObj, currentState, buildSites);
        }
    })
    allCreeps.forEach(creepObj => {
        if(creepObj.memory.role === Constants.CREEP_WORKER ||
            creepObj.memory.role === Constants.CREEP_WORKER_MINER ||
            creepObj.memory.role === Constants.CREEP_WORKER_CARRY) {
            Worker.run(spawn, creepObj, currentState, buildSites);
        }
    })
    allCreeps.forEach(creepObj => {
        if(creepObj.memory.role === Constants.CREEP_WORKER ||
            creepObj.memory.role === Constants.CREEP_WORKER_MINER ||
            creepObj.memory.role === Constants.CREEP_WORKER_CARRY) {
            Worker.postrun(spawn, creepObj, currentState, buildSites);
        }
    })
}

module.exports = {
    run
}