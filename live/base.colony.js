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
    if (currentState === Constants.STATE_BUILD) {
        if (extensionCount === 0 && creepsCounts.harvesterCreeps < 1) {
            //Generic ones to start you off
            const newCreep = creepMaker.makeHarvesterCreep();
            return newCreep ? creepsList.concat([newCreep]) : creepsList;
        }
        else if ((extensionCount === 0 && creepsCounts.harvesterMinerCreeps < 2) || (extensionCount > 0 && creepsCounts.harvesterMinerCreeps + creepsCounts.harvesterMinerCreeps < 3)) {
            //A couple of miners
            const newCreep = creepMaker.makeHarvesterMinerCreep();
            return newCreep ? creepsList.concat([newCreep]) : creepsList;
        }
        else {
            //The rest are carrying energy
            const newCreep = creepMaker.makeHarvesterCarryCreep();
            return newCreep ? creepsList.concat([newCreep]) : creepsList;
        }
    }
    return creepsList;
}

const run = (flag, creepMaker, extensionCount, controllerLevel, lentcreeps = []) => {
    init(flag);
    
    flag.memory.creeps = creepUtil.checkCreepStatus(flag.memory.creeps);
    const creeps = creepUtil.countCreeps(flag.memory.creeps);
    
    flag.memory.creeps = generateNewCreep(creepMaker, creeps, flag.memory.creeps, extensionCount, controllerLevel);

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
        var creepObj = Game.creeps[creep.name];
        if (!creepObj) return;

        if(creepObj.memory.role === Constants.CREEP_HARVESTER ||
            creepObj.memory.role === Constants.CREEP_HARVESTER_MINER ||
            creepObj.memory.role === Constants.CREEP_HARVESTER_CARRY) {
            Harvester.postrun(flag, creepObj);
        }
    })

    return getState(flag, creeps);
}

module.exports = {
    run
}