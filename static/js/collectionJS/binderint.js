let previousStats = null;

function toIntSafe(v) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : 0;
}

document.getElementById("binder").addEventListener("click", () => {
    const binder = document.getElementById("binderBanner");
    binder.style.display = "block";
    viewCollection()
});

document.getElementById("closeBinder").addEventListener("click", () => {
    const binder = document.getElementById("binderBanner");
    binder.style.display = "none";
});

//navigation dots
function setupBinderDots() {
    const binder = document.getElementById("binderItems");
    const dots = document.getElementById("binderDots");
    dots.innerHTML = "";
    const items = [...binder.children].filter(child => {
        const style = window.getComputedStyle(child);
        return style.display === "flex";
    });
    if (!items.length) return;
    const gridStyles = getComputedStyle(binder);
    const colValue = gridStyles.gridTemplateColumns;
    const columns = (colValue && colValue !== 'none') ? colValue.split(" ").length : 1;
    const rowCount = Math.ceil(items.length / columns);
    const averageRowHeight = binder.scrollHeight / rowCount;
    const maxScroll = binder.scrollHeight - binder.clientHeight;
    for (let i = 0; i < rowCount; i++) {
        const dot = document.createElement("div");
        dot.className = "binderDot";
        dots.appendChild(dot);
    }
    setupActiveDotTracking(binder, dots, rowCount, maxScroll);
    setTimeout(() => binder.dispatchEvent(new Event('scroll')), 50);
}

function setupActiveDotTracking(binder, dots, rowCount, maxScroll) {
    const dotEls = dots.querySelectorAll(".binderDot");
    binder.addEventListener("scroll", () => {
        const progress = binder.scrollTop / maxScroll;
        const activeRow = Math.round(progress * (rowCount - 1));
        dotEls.forEach((dot, i) => {
            dot.classList.toggle("active", i === activeRow);
        });
    });
}

function viewCollection() {
    maxBinder = 0;
    const itemsHTML = document.getElementById("binderItems")
    const rarityOrder = { 'Unique': 6, 'Mythic': 5, 'Rare': 4, 'Uncommon': 3, 'Common': 2, 'Trash': 1 };
    const sortedResults = [...pogList].sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
    const itemView = sortedResults.map((item) => {
        const name = item.name;
        const desc = item.description;
        const creator = item.creator;
        const class_name = item.subclass;
        const elem = "Fire";
        maxBinder++
        const rarity = item.rarity;
        const pogcol = item.color;
        const unique = rarity === "Unique";
        const isBronze = item.name === "Bronze Pog";
        let color = "white";
        let owned = false
        // is this possesed by the current pogAmount?
        if (pogAmount.find(n => n.name === name) && pogAmount.find(n => n.rarity === rarity) && pogAmount.find(n => n.pogcol === pogcol)) {
            owned = true;
        }
        // find rarity color details
        const match = rarityColor.find(r => r.name === rarity);
        // rarity color
        color = match ? match.color : "white";
        return `
        <div class="singleI" 
            data-elem="${elem}"
            data-desc="${desc}"
            data-creator="${creator}"
            data-class_name="${class_name}"
            data-name="${name}" 
            data-color="${pogcol}" 
            data-rarity="${rarity}"
            data-owned="${owned}" 
            data-unique="${unique}" 
            data-isbronze="${isBronze}"
        style="display: ${owned ? "flex" : "none"}; border: 4px solid ${unique ? "lightgray" : "black"}; background-color: ${owned ? (isBronze ? "#CD7F32" : "rgb(66, 51, 66)") : "black"}">
            <h4 style="color: ${owned ? color : "white"}">${owned ? name : "???"}</h4>
            <p style="font-size: 12px; margin-top: -10px">${owned ? pogcol : "???"}</p>
        </div>
    `
    }).join("");
    itemsHTML.innerHTML = itemView
    setupBinderDots();
    //click events
    document.querySelectorAll(".singleI").forEach(el => {
        el.addEventListener("click", charView);
        el.addEventListener("click", statView);
    });
}

//subclass stats for stat view
const subclassProps = {
    shielder: { health: 2300, def: 2800, speed: 100, atk: 1000 },
    absorber: { health: 6600, def: 1500, speed: 120, atk: 1000 },

    dot: { health: 2000, def: 1500, speed: 130, atk: 3000 },
    hunter: { health: 2500, def: 1200, speed: 140, atk: 3200 },
    blast: { health: 3000, def: 1300, speed: 135, atk: 2700 },
    aoe: { health: 2500, def: 1100, speed: 125, atk: 2800 },

    aa: { health: 3200, def: 1600, speed: 120, atk: 1500 },
    booster: { health: 3000, def: 1400, speed: 120, atk: 2200 },
    zoner: { health: 3500, def: 1300, speed: 90, atk: 1500 },

    weakness: { health: 3000, def: 1500, speed: 140, atk: 1800 },
    stun: { health: 2800, def: 1600, speed: 150, atk: 1400 },
    penetrate: { health: 2800, def: 1600, speed: 150, atk: 1400 },

    hot: { health: 3800, def: 1500, speed: 100, atk: 1000 },
    energy: { health: 4200, def: 1400, speed: 130, atk: 1200 },

    none: { health: 67, def: 67, speed: 67, atk: 67 }
};

function charView() {
    const name = this.dataset.name;
    const color = this.querySelector("h4").style.color;
    let notch = 0;
    switch (color) {
        case "red":
            notch += 4;
            break;
        case "yellow":
            notch += 5;
            break;
        case "lime":
            notch += 6;
            break;
        case "fuchsia":
            notch += 7;
            break;
        case "lightgray":
            notch += 8;
            break;
    }
    let notchView = ""
    for (i = 0; i < notch; i++){
        notchView += "⬣"
    }
    const unique = this.dataset.unique === "true";
    const isBronze = this.dataset.isbronze === "true";
    const single = document.querySelector("#viewed .singleI");
    const notv = document.getElementById("pognotv");
    const rarIcon = document.getElementById("rar_back");
    rarIcon.style.display = "block";
    const rarity = this.dataset.rarity
    switch (rarity) {
        case "Trash":
            rarIcon.src = "../static/icons/rarities/Trash_Notch.png";
            break;
        case "Common":
            rarIcon.src = "../static/icons/rarities/Common_Notch.png";
            break;
        case "Uncommon":
            rarIcon.src = "../static/icons/rarities/Uncommon_Notch.png";
            break;
        case "Mythic":
            rarIcon.src = "../static/icons/rarities/Mythic_Notch.png";
            break;
        case "Unique":
            rarIcon.src = "../static/icons/rarities/Unique_Notch.png";
            break;
    }
    notv.innerHTML = `${notchView}`
    single.querySelector("h4").textContent = name;
    single.style.border = `4px solid ${unique ? "lightgray" : color}`;
    single.style.backgroundColor = isBronze ? "#CD7F32" : "rgb(66, 51, 66)";
    single.querySelector("h4").style.color = color;
}

function ensureArrowEl(id) {
  let el = document.getElementById(id);
  if (el) return el;

  el = document.createElement('span');
  el.id = id;
  // ensure visible and consistent styling
  el.style.display = 'inline-block';
  el.style.minWidth = '18px';
  el.style.marginLeft = '8px';
  el.style.fontWeight = '700';
  el.style.fontSize = '14px';
  el.style.verticalAlign = 'middle';

  // Place the arrow into the dedicated container in the EJS if present (hpAr, atkAr, defAr, spdAr)
  // Arrow id is like 'HP_arrow' so derive stat key and container id
  const statKey = id.replace('_arrow', ''); // e.g. 'HP'
  const containerId = statKey.toLowerCase() + 'Ar'; // e.g. 'hpAr'
  const container = document.getElementById(containerId);
  if (container) {
    container.appendChild(el);
    return el;
  }

  // fallback: try to insert after the progress input (e.g. HP_PB)
  const progressId = statKey + '_PB';
  const input = document.getElementById(progressId);
  if (input && input.parentNode) {
    if (input.nextSibling) input.parentNode.insertBefore(el, input.nextSibling);
    else input.parentNode.appendChild(el);
    return el;
  }

  // final fallback: append to statBlock or body
  const statBlock = document.getElementById('statBlock');
  if (statBlock) statBlock.appendChild(el);
  else document.body.appendChild(el);
  return el;
}

function renderStatArrows(prev, curr) {
  const stats = ['HP','ATK','DEF','SPD'];
  stats.forEach(stat => {
    const prevVal = (prev && typeof prev[stat.toLowerCase()] !== 'undefined') ? prev[stat.toLowerCase()] : null;
    const currVal = (curr && typeof curr[stat.toLowerCase()] !== 'undefined') ? curr[stat.toLowerCase()] : null;
    const arrowEl = ensureArrowEl(stat + '_arrow');
    if (prevVal === null || prevVal === undefined) {
      arrowEl.textContent = '';
      arrowEl.title = '';
      arrowEl.style.color = '';
      arrowEl.style.visibility = 'hidden';
      return;
    }
    // make sure visible when we have a previous value
    arrowEl.style.visibility = 'visible';
    if (currVal > prevVal) {
      arrowEl.textContent = '▲';
      arrowEl.style.color = '#1aa84f'; // green
      arrowEl.title = `${stat} ↑ (was ${prevVal})`;
    } else if (currVal < prevVal) {
      arrowEl.textContent = '▼';
      arrowEl.style.color = '#e05252'; // red
      arrowEl.title = `${stat} ↓ (was ${prevVal})`;
    } else {
      arrowEl.textContent = '•';
      arrowEl.style.color = '#999';
      arrowEl.title = `${stat} = (was ${prevVal})`;
    }
  });
}

function statView() {
    document.getElementById("statBlock").style.visibility = "visible";
    const hp = document.getElementById("HP_PB");
    const atk = document.getElementById("ATK_PB");
    const def = document.getElementById("DEF_PB");
    const spd = document.getElementById("SPD_PB");

    //arrow tracking for stats bc carter hates me
    const currentlyShownName = document.querySelector('#viewed .singleI h4')?.textContent || null;
    if (currentlyShownName) {
        previousStats = {
        name: currentlyShownName,
        hp: toIntSafe(hp.value),
        atk: toIntSafe(atk.value),
        def: toIntSafe(def.value),
        spd: toIntSafe(spd.value)
        };
    } else {
        previousStats = null;
    }

    const rawClass = (this.dataset.class_name || this.dataset.class || '').toLowerCase().trim();
        const props = subclassProps[rawClass];
        if (props) {
            hp.value = props.health;
            atk.value = props.atk;
            def.value = props.def;
            spd.value = props.speed;
        }

    const currentStats = {
        name: this.dataset.name,
        hp: toIntSafe(hp.value),
        atk: toIntSafe(atk.value),
        def: toIntSafe(def.value),
        spd: toIntSafe(spd.value)
    };

    renderStatArrows(previousStats, currentStats);

    const rarity = this.dataset.rarity
    //desc text
    const descP = document.getElementById("descStat");
    descP.innerHTML = this.dataset.desc;
    //creator text
    const creatP = document.getElementById("creatorStat");
    creatP.innerHTML = this.dataset.creator;
    //class text
    const classP = document.getElementById("classStat");
    classP.innerHTML = this.dataset.class_name;
    //rarity text
    const rarP = document.getElementById("rarStat");
    rarP.innerHTML = rarity;
    //rarity icon
    const rarIcon = document.getElementById("rar_icon");
    switch (rarity) {
        case "Trash":
            rarIcon.src = "../static/icons/rarities/Trash_Notch.png";
            break;
        case "Common":
            rarIcon.src = "../static/icons/rarities/Common_Notch.png";
            break;
        case "Uncommon":
            rarIcon.src = "../static/icons/rarities/Uncommon_Notch.png";
            break;
        case "Mythic":
            rarIcon.src = "../static/icons/rarities/Mythic_Notch.png";
            break;
        case "Unique":
            rarIcon.src = "../static/icons/rarities/Unique_Notch.png";
            break;
    }
    //element text
    const elemP = document.getElementById("elemStat");
    elemP.innerHTML = this.dataset.elem;
}

