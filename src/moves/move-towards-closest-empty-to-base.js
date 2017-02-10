const findClosest = require('./find-closest');

module.exports = class {
    constructor(turns) {
        this.name = 'Move towards closest empty to base';
        this.turns = turns;
    }

    process(ai) {
        if (!ai.state.base) {
            return false;
        }
        let [closestEmpty, distanceEmpty] = findClosest(ai.state, ai.pathFinding, ai.state.base.x, ai.state.base.y, (cell) => {
            return cell.terrain === TILE_EMPTY && cell.armies === 0;
        });
        if (closestEmpty) {
            let [closestArmy, distanceArmy] = findClosest(ai.state, ai.pathFinding, closestEmpty.x, closestEmpty.y, (cell) => {
                return cell.terrain === ai.state.playerIndex && cell.armies > 1;
            });
            if (closestArmy) {
                let path = ai.pathFinding.findPath(closestArmy.x, closestArmy.y, closestEmpty.x, closestEmpty.y);
                if (path.length > 1) {
                    ai.debug('Move towards closest empty to base ' + closestArmy.x + ':' + closestArmy.y + ' ' + closestEmpty.x + ':' + closestEmpty.y + ' ' + path[1][0] + ' ' + path[1][1]);
                    let endIndex = path[1][1] * ai.state.width + path[1][0];
                    ai._socket.emit('attack', closestArmy.i, endIndex);
                    return true;
                } else {
                    ai.debug('No path to closest empty to base ' + Army.x + ':' + closest.y + ' ' + closestEmpty.x + ':' + closestEmpty.y);
                }
            } else {
                ai.debug('No closest closest empty to base.');
            }
        }
        return false;
    }
};
