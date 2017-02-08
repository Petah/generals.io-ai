const Ai = require('./src/ai');
const Match = require('./src/match');
const fs = require('fs');
const chance = new require('chance')();

// const mode = 'private';
// const mode = 'ffa';
const mode = '1v1';
// const mode = Math.random() < 0.3 ? 'ffa' : '1v1';

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use('/bower_components', express.static('bower_components'))

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/ui/index.html');
});

io.on('connection', function(socket){
    console.log('Socket connected');
});

http.listen(8674, function() {
    console.log('Listening on *:8674');
});

let match = new Match('daves_test_game');
let aiCount = mode === 'private' ? 3 : 1;
let ais = [];

for (let i = 0; i < aiCount; i++) {
    let ai = new Ai('daves_test_bot_' + i, 'ai_' + i, mode, {
        defendDistance: chance.pickone([5, 10]),
        expandEveryNthTurns: chance.pickone([3, 6]),
        captureCityDistance: chance.pickone([3, 6]),
    });
    ai.joinMatch(match);
    ais.push(ai);
}

setTimeout(() => {
    for (let i = 0; i < aiCount; i++) {
        ais[i].forceStart(match);
    }
}, 2000);

// remember ghosts
// rush base once found
// chat random quotes
// how many units can get where in how many steps

setInterval(() => {
    // let data = JSON.stringify(ais.map(ai => ai.state), (key, value) => {
    //     if (key === 'ai') {
    //         return undefined;
    //     }
    //     return value;
    // });
    io.emit('data', ais.map(ai => ai.state));
//     if (data) {
//         try {
//             fs.writeFileSync(__dirname + '/data/ais.json', data, () => {});
//         } catch (error) {
//             console.log(error);
//         }
//     }

    for (let i = 0; i < ais.length; i++) {
        if (!ais[i].finished) {
            return;
        }
    }
    if (ais.length > 0) {
        process.exit();
    }
}, 500);

// const stdin = process.stdin;
// stdin.setRawMode(true);
// stdin.resume();
// stdin.setEncoding('utf8');
// stdin.on('data', (key) => {
//     if (key === ' ') {
//         for (let i = 0; i < aiCount; i++) {
//             ais[i].leaveMatch();
//         }
//     }
//     if (key === '\u0003') {
//         process.exit();
//     }
// });
