const State = require('./../state');
const findBiggestArmy = require('./find-biggest-army');
const findClosest = require('./find-closest');

module.exports = function(ai) {
    let biggestArmy = findBiggestArmy(ai);
    if (!biggestArmy) {
        return false;
    }
    let [closest, distance] = findClosest(ai, biggestArmy.x, biggestArmy.y, (cell) => {
        return cell.terrain === State.TILE_EMPTY && cell.armies === 0;
    });
    if (closest) {
        let path = ai.pathFinding.findPath(biggestArmy.x, biggestArmy.y, closest.x, closest.y);
        if (path.length > 1) {
            ai.debug('Move towards empty ' + biggestArmy.x + ' ' + biggestArmy.y + ' ' + closest.x + ' ' + closest.y + ' ' + path[1][0] + ' ' + path[1][1]);
            let endIndex = path[1][1] * ai.state.width + path[1][0];
            ai._socket.emit('attack', biggestArmy.i, endIndex);
            return true;
        } else {
            ai.debug('No path to empty ' + biggestArmy.x + ' ' + biggestArmy.y + ' ' + closest.x + ' ' + closest.y);
        }
    } else {
        ai.debug('No closest empty.');
    }
    return false;
}
