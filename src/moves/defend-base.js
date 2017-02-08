const State = require('./../state');
const findClosest = require('./find-closest');

module.exports = function(ai, defendDistance) {
    if (!ai.state.base) {
        return false;
    }
    let [closestEnemy, closestEnemyDistance] = findClosest(ai, ai.state.base.x, ai.state.base.y, (cell) => {
        return cell.terrain >= 0 && cell.terrain !== ai.playerIndex;
    });
    if (closestEnemyDistance !== null && closestEnemyDistance <= defendDistance) {
        ai.debug('DEFEND ' + closestEnemyDistance + ' !!!!');
        let [closestArmy, closestArmyDistance] = findClosest(ai, closestEnemy.x, closestEnemy.y, (cell) => {
            return cell.terrain === ai.playerIndex && cell.armies > 2 && cell.armies > Math.ceil(closestEnemy.armies / 2);
        });
        if (closestArmy) {
            let path = ai.pathFinding.findPath(closestArmy.x, closestArmy.y, closestEnemy.x, closestEnemy.y);
            if (path.length > 1) {
                ai.debug('Defend' +
                    ' s' + closestArmy.x + ':' + closestArmy.y + ' ' +
                    ' e' + closestEnemy.x + ':' + closestEnemy.y + ' ' +
                    ' p' + path[1][0] + ':' + path[1][1] +
                    ' a' + closestArmy.armies + ' ' + closestEnemy.armies);
                let endIndex = path[1][1] * ai.state.width + path[1][0];
                ai._socket.emit('attack', closestArmy.i, endIndex);
                return true;
            } else {
                ai.debug('No path to defend ' + closestArmy.x + ' ' + closestArmy.y + ' ' + closestEnemy.x + ' ' + closestEnemy.y);
            }
        } else {
            ai.debug('No army to use for defense.');
        }
    }
    return false;
}
