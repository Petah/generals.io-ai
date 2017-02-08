const fs = require('fs');

let history = JSON.parse(fs.readFileSync(__dirname + '/data/history.json', 'utf8'));
console.log('FFA');
console.log('Won: ' + history.reduce((p, c) => p + (c.won && c.mode === 'ffa' ? 1 : 0), 0));
console.log('Lost: ' + history.reduce((p, c) => p + (!c.won && c.mode === 'ffa' ? 1 : 0), 0));
console.log('Total: ' + history.reduce((p, c) => p + (c.mode === 'ffa' ? 1 : 0), 0));

console.log('');
console.log('1v1');
console.log('Won: ' + history.reduce((p, c) => p + (c.won && c.mode === '1v1' ? 1 : 0), 0));
console.log('Lost: ' + history.reduce((p, c) => p + (!c.won && c.mode === '1v1' ? 1 : 0), 0));
console.log('Total: ' + history.reduce((p, c) => p + (c.mode === '1v1' ? 1 : 0), 0));

const statCounts = {};
for (let i = 0; i < history.length; i++) {
    if (!history[i].stats) {
        continue;
    }
    let key = JSON.stringify(history[i].stats);
    if (!statCounts[key]) {
        statCounts[key] = {
            wins: 0,
            loses: 0,
            stats: history[i].stats,
        };
    }
    if (history[i].won) {
        statCounts[key].wins++;
    } else {
        statCounts[key].loses++;
    }
}

for (let key in statCounts) {
    console.log('');
    console.log(statCounts[key].stats);
    console.log('Won: ' + statCounts[key].wins);
    console.log('Lost: ' + statCounts[key].loses);
    console.log('Total: ' + (statCounts[key].wins + statCounts[key].loses));
}