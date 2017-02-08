const fs = require('fs');

let history = JSON.parse(fs.readFileSync(__dirname + '/data/history.json', 'utf8'));
console.log('FFA');
console.log('Won: ' + history.reduce((p, c) => p + (c.won && c.mode === 'ffa' ? 1 : 0), 0));
console.log('Lost: ' + history.reduce((p, c) => p + (!c.won && c.mode === 'ffa' ? 1 : 0), 0));
console.log('Total: ' + history.reduce((p, c) => p + (c.mode === 'ffa' ? 1 : 0), 0));

console.log('1v1');
console.log('Won: ' + history.reduce((p, c) => p + (c.won && c.mode === '1v1' ? 1 : 0), 0));
console.log('Lost: ' + history.reduce((p, c) => p + (!c.won && c.mode === '1v1' ? 1 : 0), 0));
console.log('Total: ' + history.reduce((p, c) => p + (c.mode === '1v1' ? 1 : 0), 0));
