const Ai = require('./src/ai');
const Match = require('./src/match');
const fs = require('fs');

let match = new Match('daves_test_game');
let aiCount = 3;
let ais = [];

for (let i = 0; i < aiCount; i++) {
    let ai = new Ai('daves_test_bot_' + i, 'ai_' + i, 'private');
    // let ai = new Ai('daves_test_bot_' + i, 'ai_' + i, '1v1');
    ai.joinMatch(match);
    ais.push(ai);
}

setTimeout(() => {
    for (let i = 0; i < aiCount; i++) {
        ais[i].forceStart(match);
    }
}, 3000);
// chat random quotes

setInterval(() => {
    fs.writeFile(__dirname + '/data/ais.json', JSON.stringify(ais.map(ai => ai.state), (key, value) => {
        if (key === 'ai') {
            return undefined;
        }
        return value;
    }), () => {});
}, 500);

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
