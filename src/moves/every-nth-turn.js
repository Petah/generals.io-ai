module.exports = class {
    constructor(numTurns, subStrategy) {
        this.name = 'Every nth turn: ' + numTurns;
        this.numTurns = numTurns;
        this.subStrategy = subStrategy;
    }

    process(ai) {
        if (ai.state.turn % this.numTurns === 0) {
            return this.subStrategy.process(ai);
        }
        return false;
    }
}
