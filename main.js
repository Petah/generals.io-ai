const Ai = require('./src/ai');
const Match = require('./src/match');
const fs = require('fs');
const chance = new require('chance')();
const mp = require('./mp');
const extend = require('extend');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

let config = require('./config/' + process.argv[2]);
config = extend({
    aiCount: 1,
    mode: '1v1',
    port: 8674,
}, config);

// const mode = 'private';
// const mode = 'ffa';
// const mode = '2v2';
// const mode = '1v1';
// const mode = Math.random() < 0.3 ? 'ffa' : '1v1';
// const aiCount = mode === 'private' ? 3 : 1;
// const aiCount = 2;

const aiCount = process.argv[3];

app.use('/bower_components', express.static('bower_components'))

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/ui/index.html');
});

io.on('connection', function(socket){
    console.log('Socket connected');
});

http.listen(config.port, function() {
    console.log('Listening on *:' + config.port);
});

let match = new Match('daves_test_game');
let ais = [];

for (let i = 0; i < config.aiCount; i++) {
    let ai = new Ai('daves_test_bot_' + i, 'ai_' + i, config.mode, {
        defendDistance: chance.pickone([5, 10]),
        expandEveryNthTurns: chance.pickone([3, 6]),
        captureCityDistance: chance.pickone([3, 6]),
    }, mp.fork({
        worker: 'calculate-paths',
    }));
    ai.joinMatch(match);
    ais.push(ai);
}

setTimeout(() => {
    for (let i = 0; i < config.aiCount; i++) {
        ais[i].forceStart(match);
    }
}, 2000);

// remember ghosts
// rush base once found
// chat random quotes
// how many units can get where in how many steps
// updaet finish him to check clost distance and if there is enough units in path
// 2v2

setInterval(() => {
    io.emit('data', ais.map(ai => ai.state));

    for (let i = 0; i < ais.length; i++) {
        if (!ais[i].finished) {
            return;
        }
    }
    if (ais.length > 0) {
        process.exit();
    }
}, 500);
