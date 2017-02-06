const Ai = require('./src/ai');
const Match = require('./src/match');
const fs = require('fs');

const mode = 'private';

let match = new Match('daves_test_game');
let aiCount = mode === 'private' ? 3 : 1;
let ais = [];

for (let i = 0; i < aiCount; i++) {
    let ai = new Ai('daves_test_bot_' + i, 'ai_' + i, mode);
    ai.joinMatch(match);
    ais.push(ai);
}

setTimeout(() => {
    for (let i = 0; i < aiCount; i++) {
        ais[i].forceStart(match);
    }
}, 3000);

// remember ghosts
// rush base once found
// chat random quotes
// how many units can get where in how many steps

setInterval(() => {
    let data = JSON.stringify(ais.map(ai => ai.state), (key, value) => {
        if (key === 'ai') {
            return undefined;
        }
        return value;
    });
    if (data) {
        fs.writeFileSync(__dirname + '/data/ais.json', data, () => {});
    }

    for (let i = 0; i < aiCount; i++) {
        if (!ais[i].finished) {
            return;
        }
    }
    process.exit();
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
