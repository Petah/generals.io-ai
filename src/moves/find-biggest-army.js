module.exports = (ai, callback) => {
    let biggest = null;
    for (let r = 0; r < ai.state.height; r++) {
        for (let c = 0; c < ai.state.width; c++) {
            let cell = ai.state.rows[r][c];
            if (cell.terrain === ai.state.playerIndex && cell.armies > 1) {
                if (biggest === null || cell.armies > biggest.armies) {
                    if (!callback || callback(cell)) {
                        biggest = cell;
                    }
                }
            }
        }
    }
    return biggest;
};
