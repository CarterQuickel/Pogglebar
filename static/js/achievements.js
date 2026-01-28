// Client-side achievements script
// Initialize userdata and DOM references after DOMContentLoaded
let achievementContainer = null;
 
document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('slider');
    if (slider) {
        //slider stuff cuz it pmo
        if (!slider.style.position) slider.style.position = 'fixed';
        slider.style.transition = `left ${TRANSITION_MS}ms ease`;
        slider.style.left = SLIDE_OUT; // start hidden
    }
 
    achievementContainer = document.getElementById('achievementsList');
 
    if (userdata && userdata.theme === 'light') {
        document.body.style.backgroundColor = 'white';
        document.body.style.color = 'black';
    } else if (userdata && userdata.theme === 'dark') {
        document.body.style.backgroundColor = 'black';
        document.body.style.color = 'white';
    }
 
    // start periodic checks now that DOM and userdata are available
    setInterval(collectFunc, 1000);
    setInterval(levelFuncs, 1000);
    setInterval(progFunc, 1000);
    setInterval(econFunc, 1000);
    setInterval(uniqueFunc, 1000);
});
 
 
 
 
const achievements = window.achievements || (typeof userdata !== 'undefined' && userdata.achievements) || [];
 
 
 
// category variable
let cate = "";
 
// initial render
function renderCollection () {
    cate = "collection";
    achievementContainer.innerHTML = "";
    achievements[0].forEach((achievement, index) => {
        const achievementElement = document.createElement("div");
        achievementElement.classList.add("achievement");
        achievementElement.id = `achievement-${index}`;
 
        if (achievement.hidden && !achievement.status) {
            // Darken and replace content for hidden achievements
            achievementElement.style.backgroundColor = "#333";
            achievementElement.innerHTML = `
                <span class="icon">?</span>
            `;
        } else if (achievement.status) {
            // Render unlocked achievements with glowing effect
            achievementElement.style.backgroundColor = "#8e6fa9";
            achievementElement.style.border = "2px solid #FFFFFF"; // Solid border
            achievementElement.style.boxShadow = "0 0 10px #FFFFFF"; // Glowing effect
            const img = document.createElement("img")
            achievementElement.innerHTML = `
                <img src="${achievement.icon}" width="100" height="100"><br>
                <span class="name">${achievement.name}</span><br>
                <span class="description">${achievement.description}</span><br>
            `;
        } else {
            // Render normal visible achievements
            achievementElement.innerHTML = `
                <img src="${achievement.icon}" width="100" height="100"><br>
                <span class="name">${achievement.name}</span><br>
                <span class="description">${achievement.description}</span><br>
            `;
        }
 
        achievementContainer.appendChild(achievementElement);
    });
}
function renderLevel () {
    cate = "level";
    achievementContainer.innerHTML = "";
    achievements[1].forEach((achievement, index) => {
        const achievementElement = document.createElement("div");
        achievementElement.classList.add("achievement");
        achievementElement.id = `achievement-${index}`;
 
        if (achievement.hidden && !achievement.status) {
            // Darken and replace content for hidden achievements
            achievementElement.style.backgroundColor = "#333";
            achievementElement.innerHTML = `
                <span class="icon">?</span>
            `;
        } else if (achievement.status) {
            // Render unlocked achievements with glowing effect
            achievementElement.style.backgroundColor = "#8e6fa9";
            achievementElement.style.border = "2px solid #FFFFFF"; // Solid border
            achievementElement.style.boxShadow = "0 0 10px #FFFFFF"; // Glowing effect
            achievementElement.innerHTML = `
                <img src="${achievement.icon}" width="100" height="100"><br>
                <span class="name">${achievement.name}</span><br>
                <span class="description">${achievement.description}</span><br>
            `;
        } else {
            // Render normal visible achievements
            achievementElement.innerHTML = `
                <img src="${achievement.icon}" width="100" height="100"><br>
                <span class="name">${achievement.name}</span><br>
                <span class="description">${achievement.description}</span><br>
            `;
        }
 
        achievementContainer.appendChild(achievementElement);
    });
}
function renderProgression () {
    cate = "progression";
    achievementContainer.innerHTML = "";
    achievements[2].forEach((achievement, index) => {
        const achievementElement = document.createElement("div");
        achievementElement.classList.add("achievement");
        achievementElement.id = `achievement-${index}`;
 
        if (achievement.hidden && !achievement.status) {
            // Darken and replace content for hidden achievements
            achievementElement.style.backgroundColor = "#333";
            achievementElement.innerHTML = `
                <span class="icon">?</span>
            `;
        } else if (achievement.status) {
            // Render unlocked achievements with glowing effect
            achievementElement.style.backgroundColor = "#8e6fa9";
            achievementElement.style.border = "2px solid #FFFFFF"; // Solid border
            achievementElement.style.boxShadow = "0 0 10px #FFFFFF"; // Glowing effect
            achievementElement.innerHTML = `
                <img src="${achievement.icon}" width="100" height="100"><br>
                <span class="name">${achievement.name}</span><br>
                <span class="description">${achievement.description}</span><br>
            `;
        } else {
            // Render normal visible achievements
            achievementElement.innerHTML = `
                <img src="${achievement.icon}" width="100" height="100"><br>
                <span class="name">${achievement.name}</span><br>
                <span class="description">${achievement.description}</span><br>
            `;
        }
 
        achievementContainer.appendChild(achievementElement);
    });  
}
function renderEconomy () {
    cate = "economy";
    achievementContainer.innerHTML = "";
    achievements[3].forEach((achievement, index) => {
        const achievementElement = document.createElement("div");
        achievementElement.classList.add("achievement");
        achievementElement.id = `achievement-${index}`;
 
        if (achievement.hidden && !achievement.status) {
            // Darken and replace content for hidden achievements
            achievementElement.style.backgroundColor = "#333";
            achievementElement.innerHTML = `
                <span class="icon">?</span>
            `;
        } else if (achievement.status) {
            // Render unlocked achievements with glowing effect
            achievementElement.style.backgroundColor = "#8e6fa9";
            achievementElement.style.border = "2px solid #FFFFFF"; // Solid border
            achievementElement.style.boxShadow = "0 0 10px #FFFFFF"; // Glowing effect
            achievementElement.innerHTML = `
                <img src="${achievement.icon}" width="100" height="100"><br>
                <span class="name">${achievement.name}</span><br>
                <span class="description">${achievement.description}</span><br>
            `;
        } else {
            // Render normal visible achievements
            achievementElement.innerHTML = `
                <img src="${achievement.icon}" width="100" height="100"><br>
                <span class="name">${achievement.name}</span><br>
                <span class="description">${achievement.description}</span><br>
            `;
        }
 
        achievementContainer.appendChild(achievementElement);
    });
}
function renderUnique() {
    cate = "unique";
    achievementContainer.innerHTML = "";
    achievements[4].forEach((achievement, index) => {
        const achievementElement = document.createElement("div");
        achievementElement.classList.add("achievement");
        achievementElement.id = `achievement-${index}`;
 
        if (achievement.hidden && !achievement.status) {
            // Darken and replace content for hidden achievements
            achievementElement.style.backgroundColor = "#333";
            achievementElement.innerHTML = `
                <span class="icon">?</span>
                
            `;
        } else if (achievement.status) {
            // Render unlocked achievements with glowing effect
            achievementElement.style.backgroundColor = "#8e6fa9";
            achievementElement.style.border = "2px solid #FFFFFF"; // Solid border
            achievementElement.style.boxShadow = "0 0 10px #FFFFFF"; // Glowing effect
            achievementElement.innerHTML = `
                <img src="${achievement.icon}" width="100" height="100"><br>
                <span class="name">${achievement.name}</span><br>
                <span class="description">${achievement.description}</span><br>
            `;
        } else {
            // Render normal visible achievements
            achievementElement.innerHTML = `
                <img src="${achievement.icon}" width="100" height="100"><br>
                <span class="name">${achievement.name}</span><br>
                <span class="description">${achievement.description}</span><br>
            `;
        }
 
        achievementContainer.appendChild(achievementElement);
    });
}
 
// highlight selected category button
setInterval(() => {
    try {
        const ids = ['collection','level','progression','economy','unique'];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            // explicitly reset then apply highlight only to the active category
            el.style.border = (cate === id) ? '2px solid white' : 'none';
        });
    } catch (e) { /* ignore */ }
}, 100);
 
// #8e6fa9 (carter dont worry abt ts)
 
function fetchLeaderboardAndCheck() {
    // require credentials so server can tell who is current session user (if needed)
    fetch('/api/leaderboard', { credentials: 'include' })
        .then(res => res.ok ? res.json() : Promise.resolve([]))
        .then(rows => {
            if (!Array.isArray(rows)) return;
            const myName = (userdata && (userdata.displayName || userdata.displayname || '')).toString().toLowerCase();
            let rank = null;
            for (let i = 0; i < rows.length; i++) {
                const name = ((rows[i].displayname || rows[i].displayName) || '').toString().toLowerCase();
                if (name && myName && name === myName) {
                    rank = i + 1;
                    window.userRank = rank; // store globally for other funcs
                    break;
                }
            }
        })
        .catch(err => {
            console.error('Error fetching leaderboard:', err);
        });
}
 
fetchLeaderboardAndCheck();
setInterval(fetchLeaderboardAndCheck, 1000);
 
function collectFunc() {
    for (let i = 0; i < achievements[0].length; i++) {
        const achievement = achievements[0][i];
        switch (achievement.name) {
            case "Full Combo!":
                if (!achievement.status) {
                    achievement.status = userdata.highestCombo >= 3 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Coneisseur":
                if (!achievement.status) {
                    achievement.status = userdata.highestCombo >= 6 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Candid Coiner":
                if (!achievement.status) {
                    achievement.status = userdata.highestCombo >= 60 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "6-7":
                if (!achievement.status) {
                    achievement.status = userdata.Isize >= 7 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Programming Prodigy":
                if (!achievement.status) {
                    const inv = userdata.inventory;
                    const CPCount = inv.filter(it => (it && it.name || '').toLowerCase().includes('cp')).length;
                    achievement.status = CPCount >= 100 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Pristine":
                if (!achievement.status) {
                    const inv = userdata.inventory;
                    const hasBronzePog = inv.some(it => (it && it.name || '').toLowerCase().includes('bronze pog'));
                    const hasSilverPog = inv.some(it => (it && it.name || '').toLowerCase().includes('silver pog'));
                    const hasGoldPog = inv.some(it => (it && it.name || '').toLowerCase().includes('gold pog'));
                    achievement.status = hasBronzePog && hasSilverPog && hasGoldPog ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Exquisite":
                if (!achievement.status) {
                    const inv = userdata.inventory;
                    const hasBronzePog = inv.some(it => (it && it.name || '').toLowerCase().includes('bronze pog'));
                    const hasSilverPog = inv.some(it => (it && it.name || '').toLowerCase().includes('silver pog'));
                    const hasGoldPog = inv.some(it => (it && it.name || '').toLowerCase().includes('gold pog'));
                    const hasDiamondPog = inv.some(it => (it && it.name || '').toLowerCase().includes('diamond pog'));
                    achievement.status = hasBronzePog && hasSilverPog && hasGoldPog && hasDiamondPog ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Mythical":
                if (!achievement.status) {
                    const inv = userdata.inventory;
                    const hasBronzePog = inv.some(it => (it && it.name || '').toLowerCase().includes('bronze pog'));
                    const hasSilverPog = inv.some(it => (it && it.name || '').toLowerCase().includes('silver pog'));
                    const hasGoldPog = inv.some(it => (it && it.name || '').toLowerCase().includes('gold pog'));
                    const hasDiamondPog = inv.some(it => (it && it.name || '').toLowerCase().includes('diamond pog'));
                    const hasAstralPog = inv.some(it => (it && it.name || '').toLowerCase().includes('astral pog'));
                    achievement.status = hasBronzePog && hasSilverPog && hasGoldPog && hasDiamondPog && hasAstralPog ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Mr. Smith":
                if (!achievement.status) {
                    const inv = userdata.inventory;
                    const hasBronzePog = inv.some(it => (it && it.name || '').toLowerCase().includes('bronze pog'));
                    const hasSilverPog = inv.some(it => (it && it.name || '').toLowerCase().includes('silver pog'));
                    const hasGoldPog = inv.some(it => (it && it.name || '').toLowerCase().includes('gold pog'));
                    const hasDiamondPog = inv.some(it => (it && it.name || '').toLowerCase().includes('diamond pog'));
                    const hasAstralPog = inv.some(it => (it && it.name || '').toLowerCase().includes('astral pog'));
                    const hasGodPog = inv.some(it => (it && it.name || '').toLowerCase().includes('god pog'));
                    achievement.status = hasBronzePog && hasSilverPog && hasGoldPog && hasDiamondPog && hasAstralPog && hasGodPog ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Hoarder":
                if (!achievement.status) {
                    achievement.status = userdata.Isize >= 60 && userdata.inventory.length >= userdata.Isize ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Insane Hoarder":
                if (!achievement.status) {
                    achievement.status = userdata.Isize >= 100 && userdata.inventory.length >= userdata.Isize ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            default:
                achievement.status = false; //set to false if no match
        }
    }
}
 
function levelFuncs() {
    for (let i = 0; i < achievements[1].length; i++) {
        const achievement = achievements[1][i];
        switch (achievement.name) {
            case "Rookie":
                if (!achievement.status) {
                    achievement.status = userdata.level >= 5 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Getting Better":
                if (!achievement.status) {
                    achievement.status = userdata.level >= 10 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Experienced":
                if (!achievement.status) {
                    achievement.status = userdata.level >= 15 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Veteran":
                if (!achievement.status) {
                    achievement.status = userdata.level >= 25 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Professional":
                if (!achievement.status) {
                    achievement.status = userdata.level >= 40 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Halfway There":
                if (!achievement.status) {
                    achievement.status = userdata.level >= 50 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Itsumi!":
                if (!achievement.status) {
                    achievement.status = userdata.level >= 64 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Prestigious":
                if (!achievement.status) {
                    achievement.status = userdata.level >= 75 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "No-Life":
                if (!achievement.status) {
                    achievement.status = userdata.level >= 100 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "What color is grass?":
                if (!achievement.status) {
                    achievement.status = userdata.level >= 101 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            default:
                achievement.status = false; // Optional: set to false if no match
        }
    }
}
 
function progFunc() {
    for (let i = 0; i < achievements[2].length; i++) {
        const achievement = achievements[2][i];
        switch (achievement.name) {
            case "First Steps":
                if (!achievement.status) {
                    achievement.status = userdata.cratesOpened >= 1 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Pogger":
                if(!achievement.status){
                    achievement.status = userdata.cratesOpened >= 100 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Merge Maniac":
                if (!achievement.status) {
                    achievement.status = userdata.mergeCount >= 1 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Merge Monster":
                if (!achievement.status) {
                    achievement.status = userdata.mergeCount >= 30 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Merge Master":
                if (!achievement.status) {
                    achievement.status = userdata.mergeCount >= 80 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "God":
                if (!achievement.status) {
                    const inv = userdata.inventory;
                    const hasGodPog = inv.some(it => (it && it.name || '').toLowerCase().includes('god pog'));
                    achievement.status = hasGodPog ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Completionist":
                if (!achievement.status) {
                    for (let c = 0; c < achievements.length - 1; c++) {
                        for (let a = 0; a < achievements[c].length; a++) {
                            if (!achievements[c][a].hidden) {
                                if (!achievements[c][a].status) {
                                    return;
                                }
                            }
                        }
                    }
                    achievement.status = true;
                    achievementNotify(achievement);
                }
                break;
            case "Secret Achiever":
                if (!achievement.status) {
                    for (let c = 0; c < achievements.length - 1; c++) {
                        for (let a = 0; a < achievements[c].length; a++) {
                            if (achievements[c][a].hidden) {
                                if (!achievements[c][a].status) {
                                    return;
                                }
                            }
                        }
                    }
                    achievement.status = true;
                    achievementNotify(achievement);
                }
                break;
            case "Platinum Trophy":
                if (!achievement.status) {
                    for (let c = 0; c < achievements.length - 1; c++) {
                        for (let a = 0; a < achievements[c].length; a++) {
                            if (!achievements[c][a].status) {
                                return;
                            }
                        }
                    }
                    achievement.status = true;
                    achievementNotify(achievement);
                }
                break;
 
            default:
                achievement.status = false; //set to false if no match
        }
    }
}
 
function econFunc() {
    for (let i = 0; i < achievements[3].length; i++) {
        const achievement = achievements[3][i];
        switch (achievement.name) {
            case "69":
                if (!achievement.status) {
                    achievement.status = userdata.inventory.length == 69 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "420":
                if (!achievement.status) {
                    achievement.status = userdata.totalSold >= 420 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Wealthy":
                if (!achievement.status) {
                    achievement.status = userdata.score >= 1000 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Rich":
                if (!achievement.status) {
                    achievement.status = userdata.score >= 1000000 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Elon":
                if (!achievement.status) {
                    achievement.status = userdata.score >= 100000000 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Entrepreneur":
                if (!achievement.status) {
                    achievement.status = userdata.income >= 2000 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Tycoon":
                if (!achievement.status) {
                    achievement.status = userdata.income >= 10000 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Pawn Broker":
                if (!achievement.status) {
                    achievement.status = userdata.income >= 50000 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Bank Breaker":
                if (!achievement.status) {
                    achievement.status = userdata.income >= 100000 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Industrialist":
                if (!achievement.status) {
                    const inv = userdata.inventory;
                    const hasRobux = inv.some(it => (it && it.name || '').toLowerCase().includes('robux') || (it && it.name || '').toLowerCase().includes('robuck'));
                    achievement.status = hasRobux ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Capitalist":
                if (!achievement.status) {
                    const inv = userdata.inventory;
                    const hasVbucks = inv.some(it => (it && it.name || '').toLowerCase().includes('v-bucks') || (it && it.name || '').toLowerCase().includes('vbuck'));
                    achievement.status = hasVbucks ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Monopoly":
                if (!achievement.status) {
                    const rank = Number(window.userRank);
                    achievement.status = Number.isInteger(window.userRank) && window.userRank >= 1 && window.userRank <= 5 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Monarch":
                if (!achievement.status) {
                    achievement.status = window.userRank === 1 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            default:
                achievement.status = false; //set to false if no match
        }
    }
}
 
function uniqueFunc() {
    for (let i = 0; i < achievements[4].length; i++) {
        const achievement = achievements[4][i];
        switch (achievement.name) {
            case "Nerdy Inspector":
                if (!achievement.status) {
                    //untracked ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Chicken Jockey!":
                if (!achievement.status) {
                const inv = userdata.inventory;
                const hasChicken = inv.some(it => (it && it.name || '').toLowerCase().includes('chicken'));
                const hasZombie = inv.some(it => (it && it.name || '').toLowerCase().includes('zombie'));
                achievement.status = hasChicken && hasZombie ? true : achievement.status;
                achievementNotify(achievement);
                }
                break;
            case "An Ender Pearl":
                if (!achievement.status) {
                    const inv = userdata.inventory;
                    const hasUpperEnder = inv.some(it => (it && it.name || '').toLowerCase().includes('upper endermen'));
                    const hasLowerEnder = inv.some(it => (it && it.name || '').toLowerCase().includes('lower endermen'));
                    achievement.status = hasUpperEnder && hasLowerEnder ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Soda Pop":
                if (!achievement.status) {
                    const inv = userdata.inventory;
                    const sodaCount = inv.filter(it => (it && it.name || '').toLowerCase().includes('soda')).length;
                    achievement.status = sodaCount >= 3 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "SODA!":
                if (!achievement.status) {
                    const inv = userdata.inventory;
                    const hasRedSoda = inv.some(it => (it && it.name || '').toLowerCase().includes('red soda'));
                    const hasGreenSoda = inv.some(it => (it && it.name || '').toLowerCase().includes('green soda'));
                    const hasBrownSoda = inv.some(it => (it && it.name || '').toLowerCase().includes('brown soda'));
                    achievement.status = hasRedSoda && hasGreenSoda && hasBrownSoda ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Sus":
                if (!achievement.status) {
                    const inv = userdata.inventory;
                    const dingusCount = inv.filter(it => (it && it.name || '').toLowerCase().includes('dingus')).length;
                    achievement.status = dingusCount >= 10 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Elden Lord":
                if (!achievement.status) {
                    const inv = userdata.inventory;
                    const eldenCount = inv.filter(it => (it && it.name || '').toLowerCase().includes('elden ring')).length;
                    achievement.status = eldenCount >= 3 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "1% of My Power":
                if (!achievement.status) {
                    const inv = userdata.inventory;
                    const shaggyCount = inv.filter(it => (it && it.name || '').toLowerCase().includes('saiyan shaggy')).length;
                    achievement.status = shaggyCount >= 3 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Ultimate Despair":
                if (!achievement.status) {
                    const inv = userdata.inventory;
                    const drCount = inv.filter(it => (it && it.name || '').toLowerCase().includes('danganronpa')).length;
                    achievement.status = drCount >= 13 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;        
            case "Shaw!":
                if (!achievement.status) {
                    const inv = userdata.inventory;
                    const hornetCount = inv.filter(it => (it && it.name || '').toLowerCase().includes('hornet')).length;
                    achievement.status = hornetCount >= 3 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Uhhh":
                if (!achievement.status) {
                    const inv = userdata.inventory;
                    const cpCount = inv.filter(it => (it && it.name || '').toLowerCase().includes('i [heart] cp')).length;
                    achievement.status = cpCount >= 1 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Reflection":
                if (!achievement.status) {
                    const inv = userdata.inventory;
                    const vaultCount = inv.filter(it => (it && it.name || '').toLowerCase().includes('fallout vault')).length;
                    achievement.status = vaultCount >= 3 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Pineapple Under the Sea":
                if (!achievement.status) {
                    const inv = userdata.inventory;
                    const sbCount = inv.filter(it => (it && it.name || '').toLowerCase().includes('spongebob squarepants')).length;
                    achievement.status = sbCount >= 3 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Mog Pog":
                if (!achievement.status) {
                    const inv = userdata.inventory;
                    const squidCount = inv.filter(it => (it && it.name || '').toLowerCase().includes('squidward')).length;
                    achievement.status = squidCount >= 3 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Goon":
                if (!achievement.status) {
                    const inv = userdata.inventory;
                    const goonCount = inv.filter(it => (it && it.name || '').toLowerCase().includes('anime girl')).length;
                    achievement.status = goonCount >= 3 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Margot Robbie":
                if (!achievement.status) {
                    const inv = userdata.inventory;
                    const barbieCount = inv.filter(it => (it && it.name || '').toLowerCase().includes('barbie')).length;
                    achievement.status = barbieCount >= 3 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "I am Vengeance":
                if (!achievement.status) {
                    const inv = userdata.inventory;
                    const brCount = inv.filter(it => (it && it.name || '').toLowerCase().includes('batman & robin')).length;
                    achievement.status = brCount >= 12 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Nuke Kaboom":
                if (!achievement.status) {
                    const inv = userdata.inventory;
                    const nkCount = inv.filter(it => (it && it.name || '').toLowerCase().includes('thomas nuke')).length;
                    achievement.status = nkCount >= 3 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Hiding in your WiFi":
                if (!achievement.status) {
                    const inv = userdata.inventory;
                    const mikuCount = inv.filter(it => (it && it.name || '').toLowerCase().includes('hatsune miku')).length;
                    achievement.status = mikuCount >= 3 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "Strange Man's Game":
                if (!achievement.status) {
                    const inv = userdata.inventory;
                    const smCount = inv.filter(it => (it && it.name || '').toLowerCase().includes('elf biker')).length;
                    achievement.status = smCount >= 3 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "buttr":
                if (!achievement.status) {
                    const inv = userdata.inventory;
                    const buttrCount = inv.filter(it => (it && it.name || '').toLowerCase().includes('butter pog')).length;
                    achievement.status = buttrCount >= 3 ? true : achievement.status;
                    achievementNotify(achievement);
                }
                break;
            case "OAUTH":
                if (!achievement.status) {
                    const inv = userdata.inventory;
                    const fbCount = inv.filter(it => (it && it.name || '').toLowerCase().includes('formbar')).length;
                    achievement.status = fbCount >= 1 ? true : achievement.status;
                    achievementNotify(achievement);
                }
            default:
                achievement.status = false; //set to false if no match
        }
    }
}
 
//notification slider logic bc im lazy
const achievementQueue = [];
let sliderBusy = false;
const SLIDE_IN = "20px";
const SLIDE_OUT = "-320px";
const DISPLAY_MS = 3000;
const TRANSITION_MS = 400;
 
function achievementNotify(achievement) {
    // queue achievements instead of showing immediately
    if (achievement.status && !achievement.notified) {
        achievement.notified = true; // prevent duplicate queueing
        achievementQueue.push(achievement);
        processAchievementQueue();
        refreshAchievementsView();
    }
}
 
 
function refreshAchievementsView() {
    try {
        switch (cate) {
            case "collection": renderCollection(); break;
            case "level": renderLevel(); break;
            case "progression": renderProgression(); break;
            case "economy": renderEconomy(); break;
            case "unique": renderUnique(); break;
            default:  break;
        }
    } catch (e) {
    }
}
 
 
function processAchievementQueue() {
    if (sliderBusy) return;
    if (achievementQueue.length === 0) {
        // ensure slider is hidden if queue is empty
        const slider = document.getElementById("slider");
        if (slider) {
            slider.style.left = SLIDE_OUT;
            // clear leftover content after transition to avoid lingering visuals
            setTimeout(() => {
                slider.innerHTML = "";
            }, TRANSITION_MS);
        }
        return;
    }
 
    sliderBusy = true;
    const achievement = achievementQueue.shift();
    const slider = document.getElementById("slider");
    if (!slider) {
        achievementQueue.unshift(achievement);
        sliderBusy = false;
        setTimeout(processAchievementQueue, 200);
        return;
    }
 
    slider.innerHTML = `
       <span class="title">Achievement Unlocked!</span><br>
       <img src="${achievement.icon}" width="50" height="50"><br>
       <span class="name">${achievement.name}</span><br>
       <span class="description">${achievement.description}</span><br>
    `;
 
    if (!slider.style.transition) slider.style.transition = `left ${TRANSITION_MS}ms ease`;
 
    //me when the slider slides in
    requestAnimationFrame(() => {
        slider.style.left = SLIDE_IN;
    });
 
    //me when the slider slides out
    setTimeout(() => {
        slider.style.left = SLIDE_OUT;
        setTimeout(() => {
            // clear DOM so last item doesn't linger visually
            slider.innerHTML = "";
            sliderBusy = false;
            setTimeout(processAchievementQueue, 100);
        }, TRANSITION_MS);
    }, DISPLAY_MS);
}
 
setInterval(collectFunc, 1000);
setInterval(levelFuncs, 1000);
setInterval(progFunc, 1000);
setInterval(econFunc, 1000);
setInterval(uniqueFunc, 1000);
 
 
function checkAllAchievements() {
        collectFunc();
        levelFuncs();
        progFunc();
        econFunc();
        uniqueFunc();
        refreshAchievementsView();
}
 
window.checkAllAchievements = checkAllAchievements;
 