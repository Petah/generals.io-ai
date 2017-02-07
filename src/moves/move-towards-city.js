const State = require('./../state');
const findBiggestArmy = require('./find-biggest-army');
const findClosest = require('./find-closest');

module.exports = function(ai) {
    let biggestArmy = findBiggestArmy(ai);
    if (!biggestArmy) {
        return false;
    }
    let [closest, distance] = findClosest(ai, biggestArmy.x, biggestArmy.y, (cell) => {
        return cell.cities >= 0 && cell.terrain !== ai.playerIndex && biggestArmy.armies > cell.armies + 1;
    }, findClosest.TYPE_SHORTEST_PATH_INCLUDE_CITIES);
    if (closest && distance < 3) {
        let path = ai.pathFinding.findPathIncludeCities(biggestArmy.x, biggestArmy.y, closest.x, closest.y);
        if (path.length > 1) {
            ai.debug('Move towards city ' + biggestArmy.x + ' ' + biggestArmy.y + ' ' + closest.x + ' ' + closest.y + ' ' + path[1][0] + ' ' + path[1][1]);
            let endIndex = path[1][1] * ai.state.width + path[1][0];
            ai._socket.emit('attack', biggestArmy.i, endIndex);
            return true;
        } else {
            ai.debug('No path to city ' + biggestArmy.x + ' ' + biggestArmy.y + ' ' + closest.x + ' ' + closest.y);
        }
    } else {
        ai.debug('No closest city.');
    }
    return false;
}
