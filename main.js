const Ai = require('./src/ai');
const Match = require('./src/match');

let match = new Match('daves_test_game');
let aiCount = 3;
let ais = [];

for (let i = 0; i < aiCount; i++) {
    let ai = new Ai('daves_test_bot_' + i, 'ai_' + i);
    ai.joinMatch(match);
    ais.push(ai);
}

setTimeout(() => {
    for (let i = 0; i < aiCount; i++) {
        ais[i].forceStart(match);
    }
}, 3000);

const stdin = process.stdin;
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');
stdin.on('data', (key) => {
    if (key === ' ') {
        for (let i = 0; i < aiCount; i++) {
            ais[i].leaveMatch();
        }
    }
    if (key === '\u0003') {
        process.exit();
    }
});
