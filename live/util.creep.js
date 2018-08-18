var Constants = require('const');

const checkCreepStatus = (creeps) => {
    return creeps.map(creep => {
        if(creep === null) return null;
        var creepObj = Game.creeps[creep.name];
        return isStillAlive(creepObj, creep);
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
        if(!creepObj) return;
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

const isStillAlive = (obj, memoryObj) => {
    if (obj === undefined) {
        return memoryObj.hasSpawned ? null : memoryObj;
    }
    else {
    	return Object.assign({}, memoryObj, {
    		hasSpawned: true
    	})
    }
}

const stealFrom = (creepObj, target, roleArr, carryRole) => {
	let steal = false;
	let creepsNear = creepObj.pos.findInRange(FIND_MY_CREEPS, 1);
    if (creepsNear.length){
        for (let creep in creepsNear) {
            if (!creepObj.memory.stolenBy || creepObj.memory.stolenBy !== creepsNear[creep].name) {
                if (creepsNear[creep].carry.energy > 0 && roleArr.indexOf(creepsNear[creep].memory.role) !== -1 ) {
                    if (
                    	(creepObj.memory.role === carryRole && creepsNear[creep].memory.role !== carryRole) ||
                    		target.pos.findClosestByPath([creepObj, creepsNear[creep]]) === creepObj) {
                        creepsNear[creep].transfer(creepObj, RESOURCE_ENERGY);
                        creepsNear[creep].memory.stolenBy = creepObj.name;
                        steal = true;
                        if(creepObj.carry.energy === creepObj.energyCapacity){
                            break;
                        }
                    }
                }
            }
        }
    }
    else {
        creepObj.memory.stolenBy = null;
    }
    return steal;
}

const moveToStandby = (creep, target) => {
    creep.moveTo(new RoomPosition(target.pos.x+3, target.pos.y, target.pos.roomName));
}

module.exports = {
    checkCreepStatus,
    countCreeps,
    isStillAlive,
    stealFrom,
    moveToStandby,
}
