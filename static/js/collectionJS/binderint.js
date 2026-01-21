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
    const items = [...binder.children];
    if (!items.length) return;
    const gridStyles = getComputedStyle(binder);
    const columns = gridStyles.gridTemplateColumns.split(" ").length;
    const rowCount = Math.ceil(items.length / columns);
    const maxScroll = binder.scrollHeight - binder.clientHeight;
    for (let i = 0; i < rowCount; i++) {
        const dot = document.createElement("div");
        dot.className = "binderDot";
        dot.onclick = () => {
            const progress = i / (rowCount - 1 || 1);
            binder.scrollTo({
                top: maxScroll * progress,
                behavior: "smooth"
            });
        };
        dots.appendChild(dot);
    }
    setupActiveDotTracking(binder, dots, rowCount, maxScroll);
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
            data-name="${name}" 
             data-color="${pogcol}" 
             data-rarity="${rarity}"
             data-owned="${owned}" 
             data-unique="${unique}" 
             data-isbronze="${isBronze}"
        style="border: 4px solid ${unique ? "lightgray" : "black"}; background-color: ${owned ? (isBronze ? "#CD7F32" : "rgb(66, 51, 66)") : "black"}">
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
    const owned = this.dataset.owned === "true";
    const unique = this.dataset.unique === "true";
    const isBronze = this.dataset.isbronze === "true";
    const single = document.querySelector("#viewed .singleI");
    const notv = document.getElementById("pognotv");
    notv.innerHTML = `${notchView}`
    single.querySelector("h4").textContent = owned ? name : "???";
    single.style.border = `4px solid ${unique ? "lightgray" : "black"}`;
    single.style.backgroundColor = owned ? (isBronze ? "#CD7F32" : "rgb(66, 51, 66)") : "black";
    single.querySelector("h4").style.color = color;
}