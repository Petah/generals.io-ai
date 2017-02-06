const State = require('./../state');

module.exports = function(ai) {
    return ai.state.turn < 10;
}
