var Constants = require('const');

const isStillAlive = (obj, memoryObj) => {
    if (obj === undefined) {
        if(memoryObj.hasSpawned){
            //Has been spawned, so kill this object
            return null;
        }
        else{
            //Not spawned yet, so just skip this object
            return memoryObj;
        }
    }
    else {
    	return {
    		...memoryObj,
    		hasSpawned: true
    	}
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
                    		target.pos.findClosest([creepObj, creepsNear[creep]]) === creepObj) {
                        creepsNear[creep].transfer(creepObj, RESOURCE_ENERGY);
                        creepsNear[creep].memory.stolenBy = creepObj.name;
                        creepsNear[creep].cancelOrder("moveTo");
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

const moveToStandby = (creep, target) {
    creep.moveToRoomPosition(target.pos.x+3, target.pos.y, target.room);
}

module.exports = {
    isStillAlive,
    stealFrom,
    moveToStandby,
}
