const circles = document.getElementById('circles');
const progress = document.getElementById('progress');
const circle = document.querySelectorAll('.circle');
const rewards = {
    1: "Perk",
    2: "Perk",
    3: "Perk",
    4: "Perk",
    5: "Perk",
    6: "Global Notch"
};

function updateProgress(tierNum) {
    // Clear existing circles first
    circles.innerHTML = '';
    // Add the correct number of circles based on tierNum
    const start = document.createElement('div');
    start.className = 'circle';
    start.style = 
    'display: inline-flex; justify-content: center; align-items: center; color: black;';
    circles.appendChild(start);
    for (let i = 0; i < tierNum; i++) {
        const circleClone = document.createElement('div');
        circleClone.className = 'circle';
        circleClone.innerHTML = i + 1;
        circleClone.style = 
        'display: inline-flex; justify-content: center; align-items: center; color: black;';
        circleClone.dataset.tier = i + 1; // Store tier number
        circles.appendChild(circleClone);
    }
}

function setProgress(EXP) {
    const totalEXP = 3000;
    const percent = Math.min((EXP / totalEXP) * 100);
    progress.style.width = percent + '%';
}

// mouse event for circles
const info = document.getElementById('infoBanner');
document.addEventListener('mousemove', (e) => {
    if (e.target.classList.contains('circle')) {
        const tier = e.target.dataset.tier;
        if (tier == 0 || !rewards[tier]) {
            info.style.display = 'none';
            return;
        }
        info.style.display = 'flex';
        info.innerHTML = `Reward Tier ${tier}: ${rewards[tier]}`;
    } else {
        info.style.display = 'none';
    }
    info.style.left = e.clientX + 'px';
    info.style.top = e.clientY + 'px';
});

// Call updateProgress with the desired tier number
updateProgress(22);
const achEarned = achievements.filter(ach => ach.status === true).length;
console.log(achievements[0].length);
console.log("Achievements earned:", achEarned);
setProgress(achEarned * 50);