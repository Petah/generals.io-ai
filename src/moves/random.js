const chance = new require('chance')();

module.exports = class {
    constructor(subStrategies) {
        this.name = 'Random';
        this.subStrategies = subStrategies;
    }

    process(ai) {
        const subStrategy = chance.pickone(this.subStrategies);
        return subStrategy.process(ai);
    }
}
