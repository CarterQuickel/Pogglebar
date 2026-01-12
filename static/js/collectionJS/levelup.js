// level up
function levelup() {
    while (xp >= maxXP) {
        // max level
        if (level >= 101) {
            xp = maxXP;
            return;
        }
        xp -= maxXP;
        level++;
        maxXP = Math.floor(maxXP * 1.4);
        Isize += level % 5 === 0 ? 10 : 5; // increase inventory size by 10 every 5 levels, otherwise by 5
        if (window.checkAllAchievements) window.checkAllAchievements();
    }
}