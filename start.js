const mp = require('./mp');

console.log('Start');

global.TILE_EMPTY = -1;
global.TILE_MOUNTAIN = -2;
global.TILE_FOG = -3;
global.TILE_FOG_OBSTACLE = -4;

mp.start();
