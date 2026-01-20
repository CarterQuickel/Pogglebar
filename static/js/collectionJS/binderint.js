document.getElementById("binder").addEventListener("click", () => {
    const binder = document.getElementById("binderBanner");
    binder.style.display = "block";
    viewCollection()
});

document.getElementById("closeBinder").addEventListener("click", () => {
    const binder = document.getElementById("binderBanner");
    binder.style.display = "none";
});

const chars = document.querySelectorAll(".singleI")
function charView() {
    console.log("yes")
}

chars.forEach(button => {
    button.addEventListener("click", charView());
});

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
        <div class="singleI" style="border: 4px solid ${unique ? "lightgray" : "black"}; background-color: ${owned ? (isBronze ? "#CD7F32" : "rgb(66, 51, 66)") : "black"}">
            <h4 style="color: ${owned ? color : "white"}">${owned ? name : "???"}</h4>
            <p style="font-size: 12px; margin-top: -10px">${owned ? pogcol : "???"}</p>
        </div>
    `
    }).join("");
    itemsHTML.innerHTML = itemView
}