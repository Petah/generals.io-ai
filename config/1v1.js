const Strategy = require('../src/moves');
const chance = new require('chance')();

module.exports = {
    port: 8674,
    ais: [
        {
            mode: '1v1',
            name: 'ai_0',
            strategy: [
                new Strategy.FinishHim(),
                new Strategy.DefendBase(7),
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
