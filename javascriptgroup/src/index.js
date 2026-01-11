import * as toolkit from './toolkit/toolkit.js';
import * as entity from './entity/entity.js';
import * as universe from './universe/universe.js';
import * as sim from './sim/sim.js';
console.log('ApeSDK JS baseline port loaded');
console.log('Exports:', {toolkit:Object.keys(toolkit).length, entity:Object.keys(entity).length, universe:Object.keys(universe).length, sim:Object.keys(sim).length});