const State = require('./../state');
const findBiggestArmy = require('./find-biggest-army');
const findClosest = require('./find-closest');

module.exports = function(ai) {
    if (!ai.state.base) {
        return false;
    }
    let biggestArmy = findBiggestArmy(ai);
    if (!biggestArmy) {
        return false;
    }
    let [closest, distance] = findClosest(ai, ai.state.base.x, ai.state.base.y, (cell) => {
        return cell.terrain === ai.playerIndex && cell.generals === -1 && cell.armies > (biggestArmy.armies / 4) && cell.armies < ((biggestArmy.armies / 4) * 3);
    });
    if (closest) {
        let path = ai.pathFinding.findPath(closest.x, closest.y, ai.state.base.x, ai.state.base.y);
        if (path.length > 1) {
            ai.log('Collect' + 
                ' c' + closest.x + ' ' + closest.y + ' ' + 
                ' p' + path[1][0] + ' ' + path[1][1] +
                ' a' + closest.armies + ' ' + biggestArmy.armies);
            let endIndex = path[1][1] * ai.state.width + path[1][0];
            ai._socket.emit('attack', closest.i, endIndex);
            return true;
        } else {
            ai.log('No path to base ' + closest.x + ' ' + closest.y + ' ' + ai.state.base.x + ' ' + ai.state.base.y);
        }
    } else {
        ai.log('No closest army to base ' + biggestArmy.armies);
    }
    return false;
}
