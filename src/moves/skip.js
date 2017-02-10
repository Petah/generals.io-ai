module.exports = class {
    constructor(turns) {
        this.name = 'Skip';
        this.turns = turns;
    }

    process(ai) {
        return ai.state.turn < this.turns;
    }
};
