const Strategy = require('../src/moves');

module.exports = {
    port: 8676,
    ais: [
        {
            mode: 'private',
            name: 'defend',
            strategy: [
                new Strategy.FinishHim(),
                new Strategy.DefendBase(10),
                new Strategy.MoveTowardsCity(),
                new Strategy.MoveTowardsClosestEmptyToBase(),
                new Strategy.CombineCluster(),
            ],
        },
        {
            mode: 'private',
            name: 'attack',
            strategy: [
                new Strategy.FinishHim(),
                new Strategy.DefendBase(5),
                new Strategy.MoveTowardsCity(),
                new Strategy.EveryNthTurn(3, new Strategy.Random([
                    new Strategy.CombineCluster(),
                    new Strategy.MoveAnyFreeCell(),
                    new Strategy.MoveTowardsClosestEmptyToBase(),
                ])),
                new Strategy.MoveTowardsHighestPriority(),
            ],
        },
    ],
};
