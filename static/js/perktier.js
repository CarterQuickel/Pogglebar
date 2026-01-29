const circles = document.getElementById('circles');
const progress = document.getElementById('progress');
const circle = document.querySelectorAll('.circle');
const tier = "";
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
    for (let i = 0; i < tierNum + 1; i++) {
        if (circle[i]) {
            circles.appendChild(circle[i].cloneNode(true));
        }
    }
}

// mouse event for circles
const info = document.getElementById('infoBanner');
document.addEventListener('mousemove', (e) => {
    if (e.target.classList.contains('circle')) {
        info.style.display = 'flex';
        info.innerHTML = `Reward Tier ${tier}`;
    } else {
        info.style.display = 'none';
    }
    info.style.left = e.clientX + 'px';
    info.style.top = e.clientY + 'px';
});