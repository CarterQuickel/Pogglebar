const circles = document.getElementById('circles');
const progress = document.getElementById('progress');
const circle = document.querySelectorAll('.circle');
const rewards = {
    1: "Perk",
    2: "Perk",
    3: "Perk",
    4: "+1 ⬣",
    5: "Perk",
    6: "Perk",
    7: "Perk",
    8: "Perk",
    9: "+1 ⬣",
    10: "Perk",
    11: "Perk",
    12: "Perk",
    13: "Perk",
    14: "Perk",
    15: "+1 ⬣",
    16: "Perk",
    17: "Perk",
    18: "Perk",
    19: "Perk",
    20: "Perk",
    21: "Perk",
    22: "+1 ⬣"
};

function updateProgress(tierNum) {
    // Clear existing circles first
    circles.innerHTML = '';
    // Add the correct number of circles based on tierNum
    const start = document.createElement('div');
    start.className = 'circle';
    start.style = 
    'display: inline-flex; justify-content: center; align-items: center;';
    circles.appendChild(start);
    for (let i = 0; i < tierNum; i++) {
        const circleClone = document.createElement('div');
        circleClone.className = 'circle';
        circleClone.innerHTML = i + 1;
        circleClone.style = 
        'display: inline-flex; justify-content: center; align-items: center;';
        circleClone.dataset.tier = i + 1; // Store tier number
        circles.appendChild(circleClone);
    }
}

function setProgress(EXP) {
    const totalEXP = 1100; // 22 tiers, 50 EXP each
    const percent = Math.min((EXP / totalEXP) * 100);
    if (percent > 100) {
        progress.style.width = '100%';
        return;
    }
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
        info.style.display = 'block';
        info.innerHTML = `<h4>Reward Tier ${tier}</h4>
        <h5>${rewards[tier]}</h5>`;
    } else {
        info.style.display = 'none';
    }
    info.style.left = e.clientX + 'px';
    info.style.top = e.clientY + 'px';
});

// Call updateProgress with the desired tier number
updateProgress(22);
let earned = 
    achievements[0].filter(ach => ach.status === true).length + 
    achievements[1].filter(ach => ach.status === true).length + 
    achievements[2].filter(ach => ach.status === true).length + 
    achievements[3].filter(ach => ach.status === true).length + 
    achievements[4].filter(ach => ach.status === true).length;
earned = 0;
setProgress(50 * earned);

document.getElementById('yyy').addEventListener('click', () => {
    earned += 1;
    setProgress(50 * earned);
});

function getReward(tier) {
    // Placeholder function to handle reward logic
    alert(`Reward for Tier ${tier} claimed!`);
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('circle')) {
        const tier = e.target.dataset.tier;
        const requiredEXP = tier * 50;
        const circles_list = document.querySelectorAll('.circle');
        //claimed already
        if (circles_list[tier].classList.contains('claimed')) {
            alert(`Tier ${tier} reward already claimed.`);
            return;
        }
        //claim reward
        if (earned * 50 >= requiredEXP) {
            getReward(tier);
            circles_list[tier].classList.add('claimed');
        //not enough EXP
        } else {
            alert(`Not enough EXP. Need ${requiredEXP}, have ${earned * 50}`);
        }
    }
});

setInterval(() => {
    const circles_list = document.querySelectorAll('.circle');
    for (let i = 0; i < circles_list.length; i++) {
        const tier = circles_list[i].dataset.tier;
        const requiredEXP = tier * 50;
        if (earned * 50 >= requiredEXP) {
            circles_list[i].classList.add('active');
            console.log(`Tier ${tier} is active`);
        }
    }
}, 100);