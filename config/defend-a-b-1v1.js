const chance = new require('chance')();
const Strategy = require('../src/moves');

module.exports = {
    mode: '1v1',
    aiCount: 1,
    port: 8675,
    strategy: [
        new Strategy.FinishHim(),
        new Strategy.DefendBase(chance.pickone([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])),
        new Strategy.Skip(10),
        new Strategy.MoveTowardsCity(),
        new Strategy.EveryNthTurn(3, new Strategy.Random([
            new Strategy.CombineCluster(),
            new Strategy.MoveAnyFreeCell(),
            new Strategy.MoveTowardsClosestEmptyToBase(),
        ])),
        new Strategy.MoveTowardsHighestPriority(),
    ],
};
