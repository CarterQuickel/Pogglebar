//combo tracking fgdjhkfgjhkfgfgdjk
let perNameBonus = {};
function computeComboStats() {
    const counts = {};
    for (const item of inventory) {
        counts[item.name] = (counts[item.name] || 0) + 1;
    }

    // total number of complete 3-item combos across all item types
    const newComboCount = Object.values(counts).reduce((sum, c) => sum + Math.floor(c / 3), 0);
    // highest single-item stack count (e.g. 7 of "Bronze Pog" => 7)
    const currentMaxStack = Object.values(counts).reduce((m, c) => Math.max(m, c), 0);

    if (newComboCount !== comboCount) {
        comboCount = newComboCount;
        window.comboCount = comboCount;
    }
    if (currentMaxStack > highestCombo) {
        highestCombo = currentMaxStack;
        window.highestCombo = highestCombo;
    }

    perNameBonus = {};
    for (const [name, count] of Object.entries(counts)) {
        // combo only works if 3+; multiplier increases per item (5% per item) but capped at 2x
        const rawMult = count >= 3 ? 1 + (count * 0.05) : 1;
        perNameBonus[name] = Math.min(3, rawMult);
    }
    window.perNameBonus = perNameBonus; //we love global variables

    return currentMaxStack;
}