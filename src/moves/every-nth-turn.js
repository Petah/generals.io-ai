module.exports = class {
    constructor(n, subStrategy) {
        this.name = 'Every nth turn: ' + n;
        this.n = n;
        this.subStrategy = subStrategy;
    }

    process(ai) {
        if (ai.state.turn % this.n === 0) {
            return this.subStrategy.process(ai);
        }
        return false;
    }
}
