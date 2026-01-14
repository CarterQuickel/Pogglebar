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
        Isize += 5;
        if (window.checkAllAchievements) window.checkAllAchievements();
    }
}