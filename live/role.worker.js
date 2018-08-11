var Constants = require('const');
const creepUtil = require('util.creep');

const run = (spawn, creepObj, currentState, buildSites) => {
    var target = buildSites.length > 0 ? buildSites[0] : spawn.room.controller;

    var steal = false;
    if(creepObj.memory.role !== Constants.CREEP_WORKER_CARRY && creepObj.carry.energy === 0){
        steal = creepUtil.stealFrom(creepObj, target, [Constants.CREEP_HARVESTER, Constants.CREEP_HARVESTER_CARRY, Constants.CREEP_WORKER, Constants.CREEP_WORKER_CARRY], Constants.CREEP_WORKER_CARRY);
    }

    if(creepObj.carry.energy === 0){
        creepObj.memory.task = "recharge";
    }
    else if(creepObj.carry.energy === creepObj.carryCapacity && currentState === Constants.STATE_EXPAND){
        creepObj.memory.task = "build";
    }
    else if(creepObj.carry.energy === creepObj.carryCapacity){
        creepObj.memory.task = "store";
    }

    if(creepObj.memory.task === "build" || creepObj.memory.task === "store") {

        if(creepObj.memory.role === Constants.CREEP_WORKER_CARRY){
            //If a carryer, find the closest miner to give to.
            var sources = spawn.room.find(FIND_MY_CREEPS, {
                filter:function(i){
                    return (i.memory.role === Constants.CREEP_WORKER_MINER || i.memory.role === Constants.CREEP_WORKER) && i.energy < i.energyCapacity;
                }
            });
            if(sources.length){
                creepObj.moveTo(sources[0]);
                for(var source in sources){
                    creepObj.transfer(sources, RESOURCE_ENERGY[source]);
                }
            }
            else{
                creepUtil.moveToStandby(target);
            }
        }
        else{
            var repairing = false;
            var building = false;

            var currentStructure = creepObj.memory.repairingId;
            var repairTarget;

            if(buildSites.length > 0){
                creepObj.moveTo(buildSites[0]);
                var result = creepObj.build(buildSites[0]);
                if(result === -14){
                    spawn.memory.notYet.push(buildSites[0].id);
                }
                building = true;
            }

            /*
            if(!building && currentStructure){
                if(Game.structures[currentStructure] && Game.structures[currentStructure].hits < Game.structures[currentStructure].hitsMax){
                    //Stick with one until completely fixed
                    repairTarget = Game.structures[currentStructure];
                }
                else{
                    //Clear to allow for the next one
                    creepObj.memory.repairingId = null;
                }
            }

            if(!building && !repairTarget){
                var targets = [];
                var ramparts = spawn.room.find(FIND_MY_STRUCTURES, {
                    filter: function(i) {
                        return i.structureType === STRUCTURE_RAMPART;
                    }
                });
                for(var rampart in ramparts){
                    if(!ramparts[rampart].pos.isNearTo(spawn) && ramparts[rampart].hits < ramparts[rampart].hitsMax/2){
                        targets.push(ramparts[rampart]);
                    }
                }
                var staticObjs = spawn.room.find(FIND_STRUCTURES, {
                    filter: function(i) {
                        return i.structureType === STRUCTURE_ROAD || i.structureType === STRUCTURE_WALL;
                    }
                });
                for(var staticObj in staticObjs){
                    if(staticObjs[staticObj].hits < staticObjs[staticObj].hitsMax/2){
                        targets.push(staticObjs[staticObj]);
                    }
                }

                //If none locked on, scan to find a new one
                for(var repair in targets){
                    //Save ID and assign as current target
                    creepObj.memory.repairingId = targets[repair].id;
                    repairTarget = targets[repair];
                    break;
                }
            }

            //If there is a target, fix it!
            if(repairTarget){
                creepObj.moveTo(repairTarget);
                creepObj.repair(repairTarget);
                repairing = true;
            }
            */

            if(!building && !repairing){
                if(creepObj.upgradeController(creepObj.room.controller) == ERR_NOT_IN_RANGE) {
                    creepObj.moveTo(creepObj.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
    }
    else {
        creepObj.memory.givingEnergy = null;

        if(!steal || creepObj.carry.energy < creepObj.carryCapacity){
            if(spawn.energyCapacity){
                if(spawn.energy === 0 || currentState === Constants.STATE_DEFENCE || currentState === Constants.STATE_HARVEST){
                    creepObj.moveToRoomPosition(spawn.pos.x+3, spawn.pos.y, spawn.room);
                }
                else{
                    creepObj.moveTo(spawn);
                    if(currentState !== Constants.STATE_DEFENCE && currentState !== Constants.STATE_HARVEST){
                        spawn.transferEnergy(creepObj);
                    }
                }
            }
            else{
                if(spawn.energy === 0 || currentState === Constants.STATE_DEFENCE || currentState === Constants.STATE_HARVEST){
                    creepObj.moveToRoomPosition(spawn.pos.x+3, spawn.pos.y, spawn.room);
                }
                else{
                    creepObj.moveTo(spawn);
                    if(currentState !== Constants.STATE_DEFENCE && currentState !== Constants.STATE_HARVEST){
                        spawn.transferEnergy(creepObj);
                    }
                }
            }
        }
        else{
            if(buildSites.length > 0){
                creepObj.moveTo(buildSites[0]);
                var result = creepObj.build(buildSites[0]);
                if(result === -14){
                    spawn.memory.notYet.push(buildSites[0].id);
                }
            }
            else{
                var controller = spawn.room.controller ? spawn.room.controller : spawn.room.controller;
                creepObj.moveTo(controller);
            }
        }

    }
}

module.exports = {
    run
}