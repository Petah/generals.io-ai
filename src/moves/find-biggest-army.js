module.exports = (ai) => {
    let biggest = null;
    ai.state.forEachCell((cell) => {
        if (cell.terrain === ai.playerIndex && cell.armies > 1) {
            if (biggest === null || cell.armies > biggest.armies) {
                biggest = cell;
            }
        }
    });
    return biggest;
};
