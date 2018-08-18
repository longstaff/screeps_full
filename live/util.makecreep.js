var Constants = require('const');

function makeDefenceShortCreep(spawn, extensionCount){
	var array = [MOVE, MOVE, ATTACK];
	if(extensionCount > 15){
		array = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK];
	}
	if(extensionCount > 9){
		array = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK];
	}
	if(extensionCount > 4){
		array = [TOUGH, TOUGH, TOUGH, MOVE, MOVE, ATTACK, ATTACK];
	}

	var creep = spawn.createCreep(array, undefined, {role:Constants.CREEP_DEFENCE});
	if(typeof(creep) === "string") return ({name: creep});
}
function makeDefenceRangeCreep(spawn, extensionCount){
	var array = [MOVE, MOVE, RANGED_ATTACK];
	if(extensionCount > 15){
		array = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK];
	}
	if(extensionCount > 9){
		array = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK];
	}
	if(extensionCount > 4){
		array = [TOUGH, TOUGH, TOUGH, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK];
	}
	var creep = spawn.createCreep(array, undefined, {role:Constants.CREEP_DEFENCE});
	if(typeof(creep) === "string") return ({name: creep});
}
function makeOffenceShortCreep(spawn, extensionCount){
	var creep = spawn.createCreep([TOUGH, TOUGH, MOVE, ATTACK], undefined, {role:Constants.CREEP_OFFENCE});
	if(typeof(creep) === "string") return ({name: creep});
}
function makeOffenceRangeCreep(spawn, extensionCount){
	var creep = spawn.createCreep([TOUGH, TOUGH, MOVE, RANGED_ATTACK], undefined, {role:Constants.CREEP_OFFENCE});
	if(typeof(creep) === "string") return ({name: creep});
}
function makeOffenceHealCreep(spawn, extensionCount){
	var creep = spawn.createCreep([TOUGH, TOUGH, MOVE, HEAL], undefined, {role:Constants.CREEP_OFFENCE_HEAL});
	if(typeof(creep) === "string") return ({name: creep});
}
function makeHarvesterCreep(spawn, extensionCount){
	var array = [WORK, CARRY, MOVE, MOVE];
	if(extensionCount > 15){
		array = [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE];
	}
	if(extensionCount > 9){
		array = [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
	}
	if(extensionCount > 4){
		array = [WORK, WORK, CARRY, MOVE, MOVE];
	}
	var creep = spawn.createCreep(array, undefined, {role:Constants.CREEP_HARVESTER});
	if(typeof(creep) === "string") return ({name: creep});
}
function makeHarvesterMinerCreep(spawn, extensionCount){
	var array = [WORK, WORK, CARRY, MOVE];
	if(extensionCount > 15){
		array = [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE];
	}
	if(extensionCount > 9){
		array = [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE];
	}
	if(extensionCount > 4){
		array = [WORK, WORK, WORK, CARRY, MOVE];
	}
	var creep = spawn.createCreep(array, undefined, {role:Constants.CREEP_HARVESTER_MINER});
	if(typeof(creep) === "string") return ({name: creep});
}
function makeHarvesterCarryCreep(spawn, extensionCount){
	var array = [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
	if(extensionCount > 15){
		array = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
	}
	if(extensionCount > 9){
		array = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
	}
	if(extensionCount > 4){
		array = [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
	}
	var creep = spawn.createCreep(array, undefined, {role:Constants.CREEP_HARVESTER_CARRY});
	if(typeof(creep) === "string") return ({name: creep});
}
function makeWorkerCreep(spawn, extensionCount){
	var array = [WORK, CARRY, CARRY, MOVE, MOVE];
	if(extensionCount > 15){
		array = [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
	}
	if(extensionCount > 9){
		array = [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
	}
	if(extensionCount > 4){
		array = [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE];
	}
	var creep = spawn.createCreep(array, undefined, {role:Constants.CREEP_WORKER});
	if(typeof(creep) === "string") return ({name: creep});
}
function makeWorkerMinerCreep(spawn, extensionCount){
	var array = [WORK, WORK, CARRY, MOVE];
	if(extensionCount > 15){
		array = [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE];
	}
	if(extensionCount > 9){
		array = [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE];
	}
	if(extensionCount > 4){
		array = [WORK, WORK, WORK, CARRY, MOVE];
	}
	var creep = spawn.createCreep(array, undefined, {role:Constants.CREEP_WORKER_MINER});
	if(typeof(creep) === "string") return ({name: creep});
}
function makeWorkerCarryCreep(spawn, extensionCount){
	var array = [CARRY, CARRY, CARRY, MOVE, MOVE];
	if(extensionCount > 15){
		array = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
	}
	if(extensionCount > 9){
		array = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
	}
	if(extensionCount > 4){
		array = [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
	}
	var creep = spawn.createCreep(array, undefined, {role:Constants.CREEP_WORKER_CARRY});
	if(typeof(creep) === "string") return ({name: creep});
}

module.exports = {
    makeDefenceShortCreep:makeDefenceShortCreep,
    makeDefenceRangeCreep:makeDefenceRangeCreep,
	makeOffenceHealCreep:makeOffenceHealCreep,
    makeOffenceShortCreep:makeOffenceShortCreep,
    makeOffenceRangeCreep:makeOffenceRangeCreep,
    makeHarvesterCreep:makeHarvesterCreep,
    makeHarvesterMinerCreep:makeHarvesterMinerCreep,
    makeHarvesterCarryCreep:makeHarvesterCarryCreep,
    makeWorkerCreep:makeWorkerCreep,
    makeWorkerMinerCreep:makeWorkerMinerCreep,
    makeWorkerCarryCreep:makeWorkerCarryCreep
}
