const fs = require('fs');

const output = (label, won, lost) => {
    console.log(label);
    let total = won + lost;
    console.log('Won: ' + won + ' ' + (total > 0 ? Math.round(won / total * 100) : '0') + '%');
    console.log('Lost: ' + lost + ' ' + (total > 0 ? Math.round(lost / total * 100) : '0') + '%');
    console.log('Total: ' + total);
    console.log('');
}

const sort = (obj) => {
    return Object.values(obj).sort((a, b) => (a.wins / (a.wins + a.loses)) - (b.wins / (b.wins + b.loses)));
}

let history = JSON.parse(fs.readFileSync(__dirname + '/data/history.json', 'utf8'));
output(
    'FFA',
    history.reduce((p, c) => p + (c.won && c.mode === 'ffa' ? 1 : 0), 0),
    history.reduce((p, c) => p + (!c.won && c.mode === 'ffa' ? 1 : 0), 0)
);

output(
    '1v1',
    history.reduce((p, c) => p + (c.won && c.mode === '1v1' ? 1 : 0), 0),
    history.reduce((p, c) => p + (!c.won && c.mode === '1v1' ? 1 : 0), 0)
);

let statCounts = {};
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

statCounts = sort(statCounts);

for (let i = 0; i < statCounts.length; i++) {
    output(
        statCounts[i].stats,
        statCounts[i].wins,
        statCounts[i].loses
    );
}

let playerCounts = {};
for (let i = 0; i < history.length; i++) {
    if (!history[i].stats) {
        continue;
    }
    let key = JSON.stringify(history[i].scores.map(score => score.name).sort());
    if (!playerCounts[key]) {
        playerCounts[key] = {
            key: key,
            wins: 0,
            loses: 0,
            stats: history[i].scores,
        };
    }
    if (history[i].won) {
        playerCounts[key].wins++;
    } else {
        playerCounts[key].loses++;
    }
}

playerCounts = sort(playerCounts);

for (let i = 0; i < playerCounts.length; i++) {
    output(
        playerCounts[i].key,
        playerCounts[i].wins,
        playerCounts[i].loses
    );
}
