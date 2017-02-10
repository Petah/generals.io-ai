const findBiggestArmy = require('./find-biggest-army');
const findClosest = require('./find-closest');

module.exports = class {
    constructor(captureDistance) {
        this.name = 'Move towards city';
        this.captureDistance = captureDistance;
    }

    process(ai) {
        let biggestArmy = findBiggestArmy(ai);
        if (!biggestArmy) {
            return false;
        }
        let [closest, distance] = findClosest(ai.state, ai.pathFinding, biggestArmy.x, biggestArmy.y, (cell) => {
            return cell.wasCity && cell.terrain !== ai.state.playerIndex && biggestArmy.armies > cell.armies + 1;
        }, findClosest.TYPE_SHORTEST_PATH_INCLUDE_CITIES);
        if (closest && distance <= captureDistance) {
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
};
