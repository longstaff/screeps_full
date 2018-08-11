var Defence = require('defenceCreep');
var Harvest = require('harvestCreep');
var Worker = require('workerCreep');
var Offence = require('offenceCreep');
var Constants = require('const');
var StructureMaker = require('structureMaker');
var CreepMaker = require('creepMaker');

function initState(memoryObj){
    if(!memoryObj.memory.screeps){
        memoryObj.memory.screeps = [];
    }
    if(!memoryObj.memory.hasSpawned){
        memoryObj.memory.hasSpawned = [];
    }
    if(!memoryObj.memory.buildingSites){
        memoryObj.memory.buildingSites = [];
    }
    if(!memoryObj.memory.controlLevel){
        memoryObj.memory.controlLevel = 0;
    }
    if(!memoryObj.memory.extensions){
        memoryObj.memory.extensions = 0;
    }
    if(!memoryObj.memory.notYet){
        memoryObj.memory.notYet = [];
    }
}

function copyState(from, to){
    to.memory.screeps = from.memory.screeps;
    to.memory.hasSpawned = from.memory.hasSpawned;
    to.memory.buildingSites = from.memory.buildingSites;
    to.memory.controlLevel = from.memory.controlLevel;
    to.memory.extensions = from.memory.extensions;
    to.memory.notYet = from.memory.notYet;
}

function countCreeps(memoryObj){
    var defenceCreeps = 0;
    var offenceCreeps = 0;
    var workerCreeps = 0;
    var workerMinerCreeps = 0;
    var workerCarryCreeps = 0;
    var harvesterCreeps = 0;
    var harvesterMinerCreeps = 0;
    var harvesterCarryCreeps = 0;
    var total = 0;

    var creeps = memoryObj.memory.screeps;

    for(var creep in creeps) {
        var creepObj = Game.creeps[creeps[creep]];

        if(!CreepMaker.screepIsDead(memoryObj, creeps[creep], creepObj)){
            switch(creepObj.memory.job){
                case Constants.CREEP_DEFENCE:
                    defenceCreeps ++;
                    total ++;
                    break;
                case Constants.CREEP_OFFENCE:
                    offenceCreeps ++;
                    total ++;
                    break;
                case Constants.CREEP_WORKER:
                    workerCreeps ++;
                    total ++;
                    break;
                case Constants.CREEP_WORKER_MINER:
                    workerMinerCreeps ++;
                    total ++;
                    break;
                case Constants.CREEP_WORKER_CARRY:
                    workerCarryCreeps ++;
                    total ++;
                    break;
                case Constants.CREEP_HARVESTER:
                    harvesterCreeps ++;
                    total ++;
                    break;
                case Constants.CREEP_HARVESTER_MINER:
                    harvesterMinerCreeps ++;
                    total ++;
                    break;
                case Constants.CREEP_HARVESTER_CARRY:
                    harvesterCarryCreeps ++;
                    total ++;
                    break;
            }
        }
    }

    return {
        defenceCreeps:defenceCreeps,
        offenceCreeps:offenceCreeps,
        workerCreeps:workerCreeps,
        workerMinerCreeps:workerMinerCreeps,
        workerCarryCreeps:workerCarryCreeps,
        harvesterCreeps:harvesterCreeps,
        harvesterMinerCreeps:harvesterMinerCreeps,
        harvesterCarryCreeps:harvesterCarryCreeps,
        total:total
    }
}

function getBuildSites(memoryObj){
    //TODO: Should this be in the room memory instead, stop multiple settlements building things?
    var buildSites = [];
    var activeSites = memoryObj.room.find(FIND_CONSTRUCTION_SITES);
    for(var sites in activeSites){
        if(memoryObj.memory.notYet.indexOf(activeSites[sites].id) < 0){
            buildSites.push(activeSites[sites]);
        }
    }
    return buildSites;
}

function setState(memoryObj, creepsCount){
    //For flags only
    if(memoryObj.energy === undefined && memoryObj.memory.checked !== true){
        if(creepsCount.offenceCreeps === 0){
            memoryObj.memory.checking = false;
        }

        if(creepsCount.offenceCreeps < 5 && !memoryObj.memory.checking){
            memoryObj.memory.state = Constants.STATE_AMASS;
        }
        else{
            memoryObj.memory.checking = true;
            memoryObj.memory.state = Constants.STATE_CHECK;
        }
    }
    else{
        if(creepsCount.harvesterCreeps + creepsCount.harvesterCarryCreeps + creepsCount.harvesterMinerCreeps < 6){
            memoryObj.memory.state = Constants.STATE_HARVEST;
        }
        else if(creepsCount.defenceCreeps < 5){
            memoryObj.memory.state = Constants.STATE_DEFENCE;
        }
        else if(canExpand(memoryObj)){
            memoryObj.memory.state = Constants.STATE_EXPAND;
        }
        else if(memoryObj.room.controller && memoryObj.room.controller.level < 3){
            memoryObj.memory.state = Constants.STATE_STORE;
        }
        else{
            memoryObj.memory.state = Constants.STATE_SPREAD;
        }
    }
}

function canExpand(memoryObj){
    if(memoryObj.room.controller){
        var maxSpawns = Math.max(10, (memoryObj.room.controller.level - 1)*5);

        if(memoryObj.room.controller.level > 1 && memoryObj.memory.extensions <= maxSpawns){
            if(StructureMaker.createNewExtension(memoryObj)){
                memoryObj.memory.extensions = memoryObj.memory.extensions +1;
            }
        }

        if(memoryObj.room.controller.level > 2 && memoryObj.memory.controlLevel !== memoryObj.room.controller.level){
            StructureMaker.createRoads(memoryObj);
        }
        //Only build walls for spawns
        /*
        if(memoryObj.energy && memoryObj.room.controller.level > 3 && memoryObj.memory.controlLevel !== memoryObj.room.controller.level){
            StructureMaker.createRoomDefenses(memoryObj.room);
        }
        */

        if(memoryObj.memory.controlLevel !== memoryObj.room.controller.level){
            memoryObj.memory.controlLevel = memoryObj.room.controller.level;
            memoryObj.memory.notYet = [];
        }

        var buildSites = getBuildSites(memoryObj);
        if(buildSites.length > 0){
            return true;
        }
        else{
            return false;
        }
    }
    else{
        //No controller, cant build here.
        return false;
    }
}


function moveCreeps(memoryObj, spawnObj){
    var creeps = memoryObj.memory.screeps;
    var currentState = memoryObj.memory.state;
    var buildSites = getBuildSites(memoryObj);

    //Tell creeps to do something
    for(var creep in creeps) {
        var creepObj = Game.creeps[creeps[creep]];

        if(!CreepMaker.screepIsDead(memoryObj, creeps[creep], creepObj)){

            if(creepObj.memory.job === Constants.CREEP_DEFENCE) {
                Defence(memoryObj, creepObj);
            }
            if(creepObj.memory.job === Constants.CREEP_OFFENCE) {
                Offence(memoryObj, spawnObj, creepObj, currentState, true);
            }

            if(creepObj.memory.job === Constants.CREEP_HARVESTER ||
                creepObj.memory.job === Constants.CREEP_HARVESTER_MINER ||
                creepObj.memory.job === Constants.CREEP_HARVESTER_CARRY) {
                Harvest(memoryObj, spawnObj, creepObj);
            }

            if(creepObj.memory.job === Constants.CREEP_WORKER ||
                creepObj.memory.job === Constants.CREEP_WORKER_MINER) {
                if((currentState === Constants.STATE_DEFENCE || currentState === Constants.STATE_HARVEST) && creeps.harvesterCreeps + creeps.harvesterMinerCreeps < 3){
                    Harvest(memoryObj, spawnObj, creepObj);
                }
                else{
                    Worker(memoryObj, spawnObj, creepObj, currentState, buildSites);
                }
            }
            if(creepObj.memory.job === Constants.CREEP_WORKER_CARRY) {
                Worker(memoryObj, spawnObj, creepObj, currentState, buildSites);
            }

        }

    }
}

module.exports = {
    initState:initState,
    copyState:copyState,
    getBuildSites:getBuildSites,
    setState:setState,
    canExpand:canExpand,
    countCreeps:countCreeps,
    moveCreeps:moveCreeps
}
