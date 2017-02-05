const io = require('socket.io-client');
const State = require('./state');
const PF = require('pathfinding');

module.exports = class Ai {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.playerIndex = null;
        this.state = new State(this);
    }

    joinMatch(match) {
        this.match = match;
        this.socket;
    }

    log(message) {
        this.state.log.push([this.state.turn].concat(Array.prototype.slice.call(arguments)));
        while (this.state.log.length > 10) {
            this.state.log.shift();
        }
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
                this._socket.emit('join_private', this.match.id, this.id);
	            // this._socket.emit('join_1v1', this.id);
                this.log('Joined custom game at http://bot.generals.io/games/' + encodeURIComponent(this.match.id));
            });

            this._socket.on('game_start', (data) => {
                // Get ready to start playing the game.
                this.playerIndex = data.playerIndex;
                this.state.replayUrl = 'http://bot.generals.io/replays/' + encodeURIComponent(data.replay_id);
                this.state.usernames = data.usernames;
                this.state.teams = data.teams;
                this._socket.emit('chat_message', data.chat_room, 'Hi, I am a bot. Nice to meet you!');
            });

            this._socket.on('game_update', (data) => {
                // this.log('Game update');
                // Patch the city and map diffs into our local variables.
                this.state.update(data, this);

                // Pick a random tile.
                if (require('./moves/move-towards-empty')(this)) {
                    this.log('Moved towards empty');
                    return;
                }
                if (require('./moves/move-any-free-cell')(this)) {
                    this.log('Moved any free cell');
                    return;
                }
                if (require('./moves/move-biggest-randomly')(this)) {
                    this.log('Moved biggest randomly');
                    return;
                }

                this.log('No move found.');
            });

            this._socket.on('chat_message', (chat_room, data) => {
                this.log('Chat', chat_room, data);
            });

            this._socket.on('game_lost', () => {
                this.log('Game lost ' + this.state.replayUrl);
                this._socket.emit('leave_game');
            });

            this._socket.on('game_won', () => {
                this.log('Game won ' + this.state.replayUrl);
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
}
