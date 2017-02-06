const State = require('./../state');

let pointDistance = (x1, y1, x2, y2) => {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
};

module.exports = function(ai, x, y, callback) {
    let closest = null;
    let closestDistance = null;
    ai.state.forEachCell((cell) => {
        if (callback(cell)) {
            // let distance = pointDistance(cell.x, cell.y, x, y);
            let path = ai.pathFinding.findPath(x, y, cell.x, cell.y);
            if (path.length === 0) {
                return false;
            }
            let distance = path.length;
            if (closest === null) {
                closest = cell;
                closestDistance = distance;
                return false;
            }
            if (distance < closestDistance) {
                closest = cell;
                closestDistance = distance;
            }
        }
    });
    return [closest, closestDistance];
}
