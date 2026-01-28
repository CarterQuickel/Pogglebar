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
        const class_name = "Support";
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

function charView() {
    const name = this.dataset.name;
    const color = this.querySelector("h4").style.color;
    let notch = 0
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
    notv.innerHTML = `${notchView}`
    single.querySelector("h4").textContent = name;
    single.style.border = `4px solid ${unique ? "lightgray" : "black"}`;
    single.style.backgroundColor = isBronze ? "#CD7F32" : "rgb(66, 51, 66)";
    single.querySelector("h4").style.color = color;
}

function statView() {
    document.getElementById("statBlock").style.visibility = "visible";
    const hp = document.getElementById("HP_PB");
    const atk = document.getElementById("ATK_PB");
    const def = document.getElementById("DEF_PB");
    const spd = document.getElementById("SPD_PB");
    hp.value = Math.floor(Math.random() * 101) + 10;
    atk.value = Math.floor(Math.random() * 101) + 5;
    def.value = Math.floor(Math.random() * 101) + 5;
    spd.value = Math.floor(Math.random() * 101) + 5;
    const descP = document.getElementById("descStat");
    descP.innerHTML = this.dataset.desc;
    const creatP = document.getElementById("creatorStat");
    creatP.innerHTML = this.dataset.creator;
    const classP = document.getElementById("classStat");
    classP.innerHTML = this.dataset.class_name;
    const rarP = document.getElementById("rarStat");
    rarP.innerHTML = this.dataset.rarity;
    const elemP = document.getElementById("elemStat");
    elemP.innerHTML = this.dataset.elem;
}