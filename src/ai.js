const io = require('socket.io-client');
const State = require('./state');

module.exports = class Ai {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.playerIndex = null;
    }

    joinMatch(match) {
        this.match = match;
        this.socket;
    }

    log(message) {

        console.log.apply(console, ['[' + this.name + '] '].concat(Array.prototype.slice.call(arguments)));
    }

    forceStart() {
        this.log('Force start');
        if (this._socket) {
            this._socket.emit('set_force_start', this.match.id, true);
        }
    }

    get socket() {
        if (!this._socket) {
            this.state = new State(this);

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
                // this._socket.emit('join_private', this.match.id, this.id);
	            this._socket.emit('join_1v1', this.id);
                this.log('Joined custom game at http://bot.generals.io/games/' + encodeURIComponent(this.match.id));
            });

            this._socket.on('game_start', (data) => {
                // Get ready to start playing the game.
                this.playerIndex = data.playerIndex;
                this.replayUrl = 'http://bot.generals.io/replays/' + encodeURIComponent(data.replay_id);
                this.log('Game starting! The replay will be available after the game at ' + this.replayUrl);
                this.state.usernames = data.usernames;
                this.state.teams = data.teams;
                this.log('Users: ', data.usernames);
                this.log('Teams: ', data.teams);
                this._socket.emit('chat_message', data.chat_room, 'Hi, I am a bot. Nice to meet you!');
            });

            this._socket.on('game_update', (data) => {
                // this.log('Game update');
                // Patch the city and map diffs into our local variables.
                this.state.update(data, this);

                // Pick a random tile.
                let moved = false;
                this.state.forEachCell((cell) => {
                    if (cell.terrain === this.playerIndex && cell.armies > 1) {
                        var up = this.state.getCellUp(cell.i);
                        var down = this.state.getCellDown(cell.i);
                        var left = this.state.getCellLeft(cell.i);
                        var right = this.state.getCellRight(cell.i);
                        var directions = [up, down, left, right];

                        for (var i = 0; i < directions.length; i++) {
                            var direction = directions[i];
                            if (!direction) {
                                continue;
                            }
                            if (direction.terrain == State.TILE_EMPTY && direction.cities === -1) {
                                // this.log('Move next', cell, direction);
                                moved = true;
                                this._socket.emit('attack', cell.i, direction.i);
                                return true;
                            }
                            if (direction.terrain >= 0 && direction.terrain != this.playerIndex && direction.armies < cell.armies - 1) {
                                // this.log('Attack next', cell, direction);
                                moved = true;
                                this._socket.emit('attack', cell.i, direction.i);
                                return true;
                            }
                        }
                    }
                });
                if (moved) {
                    return;
                }

                // let next = this.state.findNextCell();
                // if (next !== null) {
                //     this.log('Move next.');
                //     if (this.moveRandomFree(next)) {
                //         return;
                //     }
                // }
                let biggest = this.state.findBiggestCell();
                if (biggest !== null) {
                    // this.log('Move biggest.');
                    if (this.moveRandom(biggest)) {
                        return;
                    }
                }
                // this.log('No move found.');
            });

            this._socket.on('chat_message', (chat_room, data) => {
                this.log('Chat', chat_room, data);
            });

            this._socket.on('game_lost', () => {
                this.log('Game lost ' + this.replayUrl);
                this._socket.emit('leave_game');
            });

            this._socket.on('game_won', () => {
                this.log('Game won ' + this.replayUrl);
                this._socket.emit('leave_game');
            });
        }
    }

    leaveMatch() {
        this.log('Leaving match.')
        if (this._socket) {
            this._socket.emit('leave_game');
        }
    }

    moveRandom(index) {
        let bailout = 100;
        while (bailout > 0) {
            // If we own this tile, make a random move starting from it.
            let row = Math.floor(index / this.state.width);
            let col = index % this.state.width;
            let endIndex = index;

            let rand = Math.random();
            if (rand < 0.25 && col > 0) { // left
                endIndex--;
                // this.log('Left');
            } else if (rand < 0.5 && col < this.state.width - 1) { // right
                endIndex++;
                // this.log('Right');
            } else if (rand < 0.75 && row < this.state.height - 1) { // down
                endIndex += this.state.width;
                // this.log('Down');
            } else if (row > 0) { //up
                endIndex -= this.state.width;
                // this.log('Up');
            } else {
                // this.log('Skip');
                return false;
            }

            if (endIndex >= this.state.size) {
                this.log('Invalid');
                return false;
            }

            // Would we be attacking a city? Don't attack cities.
            if (this.state.cities.indexOf(endIndex) >= 0 && this.state.armies[index] < this.state.armies[endIndex]) {
                // this.log('City');
                return false;
            }

            // this.log('Move ' + index + ' ' + endIndex);
            this._socket.emit('attack', index, endIndex);
            return true;
        }
        this.log('Bail out');
        return false;
    }

    moveRandomFree(index) {
        let bailout = 100;
        while (bailout > 0) {
            // If we own this tile, make a random move starting from it.
            let row = Math.floor(index / this.state.width);
            let col = index % this.state.width;
            let endIndex = index;

            let rand = Math.random();
            if (rand < 0.25 && col > 0) { // left
                endIndex--;
                // this.log('Left');
            } else if (rand < 0.5 && col < this.state.width - 1) { // right
                endIndex++;
                // this.log('Right');
            } else if (rand < 0.75 && row < this.state.height - 1) { // down
                endIndex += this.state.width;
                // this.log('Down');
            } else if (row > 0) { //up
                endIndex -= this.state.width;
                // this.log('Up');
            } else {
                // this.log('Skip');
                return false;
            }

            if (endIndex >= this.state.size) {
                this.log('Invalid');
                return false;
            }

            // Would we be attacking a city? Don't attack cities.
            if (this.state.cities.indexOf(endIndex) >= 0 && this.state.armies[index] < this.state.armies[endIndex]) {
                // this.log('City');
                return false;
            }

            // Only attack empty cells
            if (this.state.terrain[endIndex] != State.TILE_EMPTY ||
                    this.state.armies[endIndex] != 0) {
                this.log('Not free');
                return false;
            }

            this._socket.emit('attack', index, endIndex);
            return true;
        }
        this.log('Bail out');
        return false;
    }
}
