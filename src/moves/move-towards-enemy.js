const State = require('./../state');
const findBiggestArmy = require('./find-biggest-army');
const findClosest = require('./find-closest');

let pointDistance = (x1, y1, x2, y2) => {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
};

module.exports = function(ai) {
    let biggestArmy = findBiggestArmy(ai);
    if (!biggestArmy) {
        return false;
    }
    let [closest, distance] = findClosest(ai, biggestArmy.x, biggestArmy.y, (cell) => {
        return cell.terrain >= 0 && cell.terrain !== ai.playerIndex;
    });
    if (closest) {
        let path = ai.pathFinding.findPath(biggestArmy.x, biggestArmy.y, closest.x, closest.y);
        if (path.length > 1) {
            ai.debug('Move towards enemy ' + biggestArmy.x + ' ' + biggestArmy.y + ' ' + closest.x + ' ' + closest.y + ' ' + path[1][0] + ' ' + path[1][1]);
            let endIndex = path[1][1] * ai.state.width + path[1][0];
            ai._socket.emit('attack', biggestArmy.i, endIndex);
            return true;
        } else {
            ai.debug('No path to enemy ' + biggestArmy.x + ' ' + biggestArmy.y + ' ' + closest.x + ' ' + closest.y);
        }
    } else {
        ai.debug('No closest enemy.');
    }
    return false;
}
