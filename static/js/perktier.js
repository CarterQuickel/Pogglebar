const circles = document.getElementById('circles');
const progress = document.getElementById('progress');
const circle = document.querySelectorAll('.circle');
// read tiers provided by `achievements.js` or server-rendered userdata
// use `tiersData` to avoid redeclaring a global `tiers` identifier
let tiersData = (typeof window !== 'undefined' && window.tiers) ? window.tiers : [];
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
        const tnum = i + 1;
        // show tier number or reward shorthand
        circleClone.innerHTML = tnum;
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

// compute earned tiers by counting achievements with notified === true
function computeEarned() {
    try {
        const achs = (typeof window !== 'undefined' && window.achievements) ? window.achievements : achievements;
        if (!Array.isArray(achs)) return 0;
        return achs.reduce((sum, cat) => {
            if (!Array.isArray(cat)) return sum;
            return sum + cat.filter(a => a && a.notified === true).length;
        }, 0);
    } catch (e) {
        return 0;
    }
}

let earned = computeEarned();
console.log('perktier: earned=', earned);
setProgress(50 * earned);

// update function exposed for other scripts to call when achievement notified state changes
function updatePerkEarned() {
    try {
        earned = computeEarned();
        setProgress(50 * earned);
        applyTierStates();
    } catch (e) { /* ignore */ }
}
window.updatePerkEarned = updatePerkEarned;

// Apply initial tier statuses (active/claimed) based on earned and tiers data
function applyTierStates() {
    const circles_list = document.querySelectorAll('.circle');
    for (let i = 0; i < circles_list.length; i++) {
        const el = circles_list[i];
        const t = Number(el.dataset.tier);
        if (!t) continue;
        // reset state classes then reapply
        el.classList.remove('active', 'claimed', 'available');
        // mark active when enough EXP
        const requiredEXP = t * 50;
        if (earned * 50 >= requiredEXP) el.classList.add('active');
        // mark claimed if tiers data says so
        const tierObj = (Array.isArray(tiersData) && tiersData.find) ? tiersData.find(x => Number(x.tier) === t) : null;
        if (tierObj && (tierObj.status === 'claimed' || tierObj.status === 'available')) {
            if (tierObj.status === 'claimed') el.classList.add('claimed');
            if (tierObj.status === 'available') el.classList.add('available');
        }
    }
}
applyTierStates();

// Load persisted tiers from server and reapply states
function loadServerTiers() {
    fetch('/api/perk-tiers', { credentials: 'include' })
        .then(res => {
            if (!res.ok) throw new Error('Failed to fetch tiers');
            return res.json();
        })
        .then(json => {
            if (json && Array.isArray(json.tiers)) {
                tiersData = json.tiers;
                if (typeof window !== 'undefined') window.tiers = tiersData;
                applyTierStates();
            }
        })
        .catch(err => {
            // not fatal; keep using client-side tiersData
            console.debug('Could not load server tiers:', err);
        });
}

// attempt to load persisted tiers from server on page load
loadServerTiers();

function getReward(tier) {
    // Placeholder function to handle reward logic
    alert(`Reward for Tier ${tier} claimed!`);
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('circle')) {
        const tier = e.target.dataset.tier;
        const requiredEXP = tier * 50;
        //claimed already
        // note: circles_list is zero-indexed; find element by dataset instead to be safe
        const clickedEl = e.target;
        if (clickedEl.classList.contains('claimed')) {
            alert(`Tier ${tier} reward already claimed.`);
            return;
        }
        //claim reward
        if (earned * 50 >= requiredEXP && !clickedEl.classList.contains('claimed')) {
            getReward(tier);
            // update UI immediately
            clickedEl.classList.add('claimed');
            // update local tiers state if present
            const tierObj = (Array.isArray(tiersData) && tiersData.find) ? tiersData.find(x => Number(x.tier) === Number(tier)) : null;
            if (tierObj) tierObj.status = 'claimed';

            // persist claim to server
            fetch('/api/perk-tiers/claim', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier: Number(tier), status: 'claimed' })
            }).then(res => {
                if (!res.ok) throw new Error('Failed to save tier claim');
                return res.json();
            }).then(json => {
                // server returned updated tiers, update local copy if provided
                if (json && Array.isArray(json.tiers)) {
                    // copy server tiers into window.tiers if present
                    if (typeof window !== 'undefined') window.tiers = json.tiers;
                }
            }).catch(err => {
                console.error('Error saving tier claim:', err);
                // revert UI and local state on failure
                clickedEl.classList.remove('claimed');
                if (tierObj) tierObj.status = 'available';
                alert('Could not save tier claim. Please try again.');
            });
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
        }
    }
}, 100);