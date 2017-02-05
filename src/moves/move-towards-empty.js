const State = require('./../state');
const findBiggestArmy = require('./find-biggest-army');

let pointDistance = (x1, y1, x2, y2) => {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
};

module.exports = function(ai) {
    let biggestArmy = findBiggestArmy(ai);
    if (!biggestArmy) {
        return false;
    }
    ai.log('Find close');
    let moved = false;
    ai.state.forEachCell((cell) => {
        let closestEmpty = null;
        let closestDistance = null;
        if (cell.terrain === State.TILE_EMPTY && cell.armies === 0) {
            let distance = pointDistance(cell.x, cell.y, biggestArmy.x, biggestArmy.y);
            ai.log('distance', distance, cell.x, cell.y, biggestArmy.x, biggestArmy.y);
            if (closestEmpty === null) {
                closestEmpty = cell;
                closestDistance = distance;
                return false;
            }
            if (distance < closestDistance) {
                closestEmpty = cell;
                closestDistance = distance;
            }
            ai.log('Clostest', closestEmpty.i);
        }
    });
    return moved;
}
