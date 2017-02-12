const Strategy = require('../src/moves');
const chance = new require('chance')();

module.exports = {
    port: 8675,
    ais: [
        {
            mode: 'ffa',
            name: 'ai_0',
            strategy: [
                new Strategy.FinishHim(),
                new Strategy.DefendBase(5),
                new Strategy.MoveTowardsCity(),
                new Strategy.EveryNthTurn(4, new Strategy.Random([
                    new Strategy.CombineCluster(),
                    new Strategy.MoveAnyFreeCell(),
                    new Strategy.MoveTowardsClosestEmptyToBase(),
                ])),
                new Strategy.MoveTowardsHighestPriority(),
            ],
        },
        {
            mode: 'ffa',
            name: 'ai_1',
            strategy: [
                new Strategy.FinishHim(),
                new Strategy.DefendBase(9),
                new Strategy.MoveTowardsCity(),
                new Strategy.EveryNthTurn(2, new Strategy.Random([
                    new Strategy.CombineCluster(),
                    new Strategy.MoveAnyFreeCell(),
                    new Strategy.MoveTowardsClosestEmptyToBase(),
                ])),
                new Strategy.MoveTowardsHighestPriority(),
            ],
        },
    ],
};
