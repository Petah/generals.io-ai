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

const configName = process.argv[2];
let config = require('./config/' + configName);
config = extend({
    port: 8674,
    ais: [],
}, config);
console.log(config);

app.use('/bower_components', express.static('bower_components'))

app.get('/angular', function(req, res) {
    res.sendFile(__dirname + '/ui/angular.html');
});

app.get('/basic', function(req, res) {
    res.sendFile(__dirname + '/ui/basic.html');
});

io.on('connection', function(socket){
    console.log('Socket connected');
});

http.listen(config.port, function() {
    console.log('Listening on *:' + config.port);
});

let match = new Match('daves_test_game');
let ais = [];

for (let i = 0; i < config.ais.length; i++) {
    let ai = new Ai('daves_test_bot_' + i, config.ais[i].name, config.ais[i].mode, config.ais[i].strategy, __dirname + '/data/history-' + configName + '-' + i + '.json', mp.fork({
        worker: 'calculate-paths',
    }));
    ai.joinMatch(match);
    ais.push(ai);
}

setTimeout(() => {
    for (let i = 0; i < ais.length; i++) {
        ais[i].forceStart(match);
    }
}, 2000);

// how many units can get where in how many steps
// updaet finish him to check clost distance and if there is enough units in path
// 2v2
// flood fill if stalemate
// combine if biggest stack next to another stack that is > averge
// 2 squads, one defends, one epxands to get free cells

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
