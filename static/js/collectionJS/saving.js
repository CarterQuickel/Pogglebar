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

function hidePanelAni(ele) {
    ele.classList.remove("showPanel");
    void ele.offsetHeight; // force reflow
    ele.classList.add("hidePanel");
    ele.style.pointerEvents = "none";
    ele.addEventListener("animationend", (e) => {
        if (e.animationName !== "close_red") return;
        ele.style.display = "none";
        ele.classList.remove("hidePanel");
    }, { once: true });
}



//Show redirect panel
function showPanelAni(ele) {
    ele.style.display = "flex";
    ele.classList.remove("hidePanel");
    ele.style.pointerEvents = "none";
    ele.classList.add("showPanel");
    ele.addEventListener("animationend", () => {
        ele.style.pointerEvents = "all";
    }, { once: true });
}

//Redirect interaction
document.getElementById("burger_btn").addEventListener("click", () => {
    const panel = document.getElementById("redirect_panel")
    const isVisible = panel.style.display === "flex";
    if (isVisible) {
        hidePanelAni(panel);
    } else {
        showPanelAni(panel)
    }
});

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