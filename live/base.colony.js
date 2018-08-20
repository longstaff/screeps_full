const Harvester = require('role.harvester');
const Worker = require('role.worker');
const Constants = require('const');

const creepUtil = require('util.creep');

const StructureMaker = require('util.makestructure');
const CreepMaker = require('util.makecreep');

const MAX_CREEPS = 4;

const init = (flag) => {
    if (!flag.memory.creeps) flag.memory.creeps = [];
    if (!flag.memory.controlLevel) flag.memory.controlLevel = 0;
}

const getState = (flag, creeps) => {
    if(creeps.harvesterCreeps + creeps.harvesterCarryCreeps + creeps.harvesterMinerCreeps < MAX_CREEPS){
        return Constants.STATE_BUILD;
    }
    else return Constants.STATE_EXPAND;
}

const generateNewCreep = (creepMaker, currentState, creepsCounts, creepsList, extensionCount, controllerLevel) => {
    const extension = (creepsCounts.harvesterMinerCreeps + creepsCounts.harvesterMinerCreeps < 1) ? 0 : extensionCount;
    
    if (currentState === Constants.STATE_BUILD) {
        if (extension === 0 && creepsCounts.harvesterCreeps < 1) {
            //Generic ones to start you off
            const newCreep = creepMaker.makeHarvesterCreep(extension);
            return newCreep ? creepsList.concat([newCreep]) : creepsList;
        }
        else if (creepsCounts.harvesterMinerCreeps < 2) {
            //A couple of miners
            const newCreep = creepMaker.makeHarvesterMinerCreep(extension);
            return newCreep ? creepsList.concat([newCreep]) : creepsList;
        }
        else {
            //The rest are carrying energy
            const newCreep = creepMaker.makeHarvesterCarryCreep(extension);
            return newCreep ? creepsList.concat([newCreep]) : creepsList;
        }
    }
    return creepsList;
}

const run = (flag, creepMaker, extensionCount, controllerLevel, lentcreeps = []) => {
    init(flag);
    
    flag.memory.creeps = creepUtil.checkCreepStatus(flag.memory.creeps);
    const creeps = creepUtil.countCreeps(flag.memory.creeps);
    const currentState = getState(flag, creeps);
    
    flag.memory.creeps = generateNewCreep(creepMaker, currentState, creeps, flag.memory.creeps, extensionCount, controllerLevel);

    //Tell creeps to do something
    const allCreeps = lentcreeps.concat(flag.memory.creeps).map(creep => {
        var creepObj = Game.creeps[creep.name];
        return creepObj ? creepObj : null;
    }).filter(creep => creep !== null);

    allCreeps.forEach(creepObj => {
        if(creepObj.memory.role === Constants.CREEP_HARVESTER ||
            creepObj.memory.role === Constants.CREEP_HARVESTER_MINER ||
            creepObj.memory.role === Constants.CREEP_HARVESTER_CARRY) {
            Harvester.prerun(flag, creepObj);
        }
    })
    allCreeps.forEach(creepObj => {
        if(creepObj.memory.role === Constants.CREEP_HARVESTER ||
            creepObj.memory.role === Constants.CREEP_HARVESTER_MINER ||
            creepObj.memory.role === Constants.CREEP_HARVESTER_CARRY) {
            Harvester.run(flag, creepObj);
        }
    })
    allCreeps.forEach(creepObj => {
        if(creepObj.memory.role === Constants.CREEP_HARVESTER ||
            creepObj.memory.role === Constants.CREEP_HARVESTER_MINER ||
            creepObj.memory.role === Constants.CREEP_HARVESTER_CARRY) {
            Harvester.postrun(flag, creepObj);
        }
    })

    return currentState;
}

module.exports = {
    run
}