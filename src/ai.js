const io = require('socket.io-client');
const State = require('./state');
const PathFinding = require('./path-finding');
const mp = require('../mp');
const fs = require('fs');
const extend = require('extend');
const chance = new require('chance')();
const atQuotes = require('at-quotes');

module.exports = class Ai {
    constructor(id, name, mode, strategy, historyFile, calculatePaths) {
        this.id = id;
        this.name = name;
        this.mode = mode;
        this.playerIndex = null;
        this.pathFinding = new PathFinding(this);
        this.finished = false;
        this.strategy = strategy;
        this.state = new State(this);
        this.calculatePaths = calculatePaths;
        this.calculatePathsPending = false;
        this.historyFile = historyFile;
    }

    joinMatch(match) {
        this.match = match;
        this.socket;
    }

    debug() {
        // this.log.apply(this, arguments);
    }

    log(message) {
        this.state.log.push([this.state.turn].concat(Array.prototype.slice.call(arguments)));
        while (this.state.log.length > 10) {
            this.state.log.shift();
        }
        console.log.apply(console, ['[' + this.name + '] ' + this.state.turn + ' '].concat(Array.prototype.slice.call(arguments)));
    }

    forceStart() {
        this.log('Force start');
        if (this._socket) {
            this._socket.emit('set_force_start', this.match.id, true);
        }
    }

    get socket() {
        if (!this._socket) {

            this._socket = io('http://botws.generals.io');

            this._socket.on('disconnect', () => {
                this.log('Disconnected from server.');
            });

            this._socket.on('connect', () => {
                this.log('Connected to server.');

                // Set the username for the bot.
                this._socket.emit('set_username', this.id, this.name);

                // Join a custom game and force start immediately.
                // Custom games are a great way to test your bot while you develop it because you can play against your bot!
                switch (this.mode) {
                    case 'private': {
                        this._socket.emit('join_private', this.match.id, this.id);
                        this.log('Joined custom game at http://bot.generals.io/games/' + encodeURIComponent(this.match.id));
                        break;
                    }
                    case '1v1': {
                        this._socket.emit('join_1v1', this.id);
                        this.log('Joined 1v1');
                        break;
                    }
                    case 'ffa': {
                        this._socket.emit('play', this.id);
                        this.log('Joined FFA');
                        break;
                    }
                    case '2v2': {
                        this._socket.emit('join_team', 'ai_x', this.id);
                        this.log('Joined 2v2');
                        break;
                    }
                }
            });

            this._socket.on('game_start', (data) => {
                // Get ready to start playing the game.
                this.state.playerIndex = data.playerIndex;
                this.state.replayUrl = 'http://bot.generals.io/replays/' + encodeURIComponent(data.replay_id);
                this.state.usernames = data.usernames;
                this.log(this.state.usernames);
                this.state.teams = data.teams;
                // this._socket.emit('chat_message', data.chat_room, 'Hi, I\'m ' + this.name + '. Nice to meet you!');
                this._socket.emit('chat_message', data.chat_room, atQuotes.getQuote());
            });

            this._socket.on('game_update', (data) => {
                let ms = new Date().getTime();
                // this.log('Game update');
                // Patch the city and map diffs into our local variables.
                this.state.update(data);
                this.pathFinding.update(this.state);

                if (!this.calculatePathsPending) {
                    this.calculatePathsPending = true;
                    mp.send(this.calculatePaths, this.state, (priorityMap) => {
                        // console.log('Finished calculating paths', priorityMap)
                        this.state.priorityMap = priorityMap;
                        this.calculatePathsPending = false;
                    });
                }

                for (let i = 0; i < this.strategy.length; i++) {
                    if (this.strategy[i].process(this)) {
                        this.log(this.strategy[i].name + ' ' + (new Date().getTime() - ms) + 'ms');
                        return;
                    }
                }

                this.log('No move found ' + (new Date().getTime() - ms) + 'ms');
            });

            this._socket.on('chat_message', (chat_room, data) => {
                this.state.chat.push([chat_room, data]);
            });

            const writeHistory = (won) => {
                try {
                    this.log('Reading ' + this.historyFile);
                    let history;
                    try {
                        history = JSON.parse(fs.readFileSync(this.historyFile, 'utf8'));
                    } catch (e) {
                        // Ignore missing file
                        history = [];
                    }
                    history.push({
                        date: new Date().getTime(),
                        won: won,
                        turns: this.state.turn,
                        mode: this.mode,
                        playerIndex: this.state.playerIndex,
                        name: this.name,
                        replayUrl: this.state.replayUrl,
                        strategy: this.strategy,
                        scores: this.state.scores.map((score) => {
                            score.name = this.state.usernames[score.i];
                            return score;
                        }),
                    });
                    this.log('Writing ' + this.historyFile);
                    fs.writeFileSync(this.historyFile, JSON.stringify(history, null, 4));
                } catch (error) {
                    console.log(error);
                }
            };

            this._socket.on('game_lost', () => {
                this.log('Game lost ' + this.state.replayUrl);
                writeHistory(false);
                this._socket.emit('leave_game');
                this.finished = true;
            });

            this._socket.on('game_won', () => {
                this.log('Game won ' + this.state.replayUrl);
                writeHistory(true);
                this._socket.emit('leave_game');
                this.finished = true;
            });
        }
    }

    leaveMatch() {
        this.log('Leaving match.')
        if (this._socket) {
            this._socket.emit('leave_game');
        }
    }
}
