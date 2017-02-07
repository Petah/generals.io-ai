const State = require('./../state');
const pointDistance = require('./point-distance');

const TYPE_SHORTEST_PATH = 1;
const TYPE_SHORTEST_PATH_IGNORE_PRIORITY = 2;
const TYPE_SHORTEST_PATH_INCLUDE_CITIES = 3;
const TYPE_POINT_DISTANCE = 4;

module.exports = function(ai, x, y, callback, distanceType = 1, allowCities = false) {
    let closest = null;
    let closestDistance = null;
    ai.state.forEachCell((cell) => {
        if (callback(cell)) {
            let distance;
            if (distanceType === TYPE_SHORTEST_PATH) {
                let path = ai.pathFinding.findPath(x, y, cell.x, cell.y);
                if (path.length === 0) {
                    return false;
                }
                distance = path.length;
            } else if (distanceType === TYPE_SHORTEST_PATH_IGNORE_PRIORITY) {
                let path = ai.pathFinding.findPathIgnorePriority(x, y, cell.x, cell.y);
                if (path.length === 0) {
                    return false;
                }
                distance = path.length;
            } else if (distanceType === TYPE_SHORTEST_PATH_INCLUDE_CITIES) {
                let path = ai.pathFinding.findPathIncludeCities(x, y, cell.x, cell.y);
                if (path.length === 0) {
                    return false;
                }
                distance = path.length;
            } else {
                distance = pointDistance(cell.x, cell.y, x, y);
            }
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

module.exports.TYPE_SHORTEST_PATH = TYPE_SHORTEST_PATH;
module.exports.TYPE_SHORTEST_PATH_IGNORE_PRIORITY = TYPE_SHORTEST_PATH_IGNORE_PRIORITY;
module.exports.TYPE_SHORTEST_PATH_INCLUDE_CITIES = TYPE_SHORTEST_PATH_INCLUDE_CITIES;
module.exports.TYPE_POINT_DISTANCE = TYPE_POINT_DISTANCE;
