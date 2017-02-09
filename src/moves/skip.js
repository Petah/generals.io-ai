const State = require('./../state');

module.exports = function(ai, turns = 10) {
    return ai.state.turn < turns;
}
