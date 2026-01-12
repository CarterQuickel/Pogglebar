function save() {
    // fetch to /datasave
    fetch('/datasave', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            lightMode: lightMode,
            money: money,
            inventory: inventory,
            Isize: Isize,
            xp: xp,
            maxXP: maxXP,
            level: level,
            income: userIncome,
            totalSold: totalSold,
            cratesOpened: cratesOpened,
            pogAmount: pogAmount,
            achievements: window.achievements,
            mergeCount: window.mergeCount,
            highestCombo: window.highestCombo,
            wish: wish,
            crates: crates,
            pfp: pfpimg
        })
    })
        .then(response => response.json())
        .then(() => {
        })
        .catch(err => {
            console.error("Error saving data:", err);
        });
}

// save game
document.getElementById("patchNotesButton").addEventListener("click", () => {
    achievements[4][0].status = true;
    save();
    window.location.href = "/patch";
});

document.getElementById("achievementsButton").addEventListener("click", () => {
    save();
    window.location.href = "/achievements";
});

document.getElementById("leaderboardButton").addEventListener("click", () => {
    save();
    window.location.href = "/leaderboard";
});

document.getElementById("chatRoomButton").addEventListener("click", () => {
    save();
    window.location.href = "/chatroom";
});

document.getElementById("marketplaceButton").addEventListener("click", () => {
    save();
    window.location.href = "/marketplace";
});