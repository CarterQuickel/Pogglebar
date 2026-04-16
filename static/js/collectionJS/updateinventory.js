// this is here so the upgrade slot button refreshes everytime a new pog is added to the DOM
function calcSlot(amount) {
    const slotPrice = 25;
    defprice = slotPrice * amount;
    return defprice;
}
function bindBuySlot() {
    const btn = document.getElementById("buySlot");
    if (!btn) return;

    console.log('[UPDATEINVENTORY] bindBuySlot attached');
    btn.addEventListener("click", () => {
        console.log('[UPDATEINVENTORY] buySlot clicked');
        document.getElementById("slotOver").style.display = "block";
        const slotPrice = calcSlot(1);
        document.getElementById("slotprice").innerText = `Price: $${abbreviateNumber(slotPrice)}`;
    });
}

//update inventory
function refreshInventory() {
    const inventoryDiv = document.getElementById("inventory");

    // count how many of each item in inventory
    const rarityCounts = {};
    inventory.forEach(item => {
        rarityCounts[item.name] = (rarityCounts[item.name] || 0) + 1;
    });

    //the computer is recomputing
    computeComboStats();

    // failsafe if they delete all items
    if (inventory.length === 0 && money < 200) {
        money = 200;
    }

    //combo highlight
    const highlightColors = Object.keys(rarityCounts).filter(rarity => rarityCounts[rarity] >= 3);

    const bronzeCount = inventory.filter(item => item.name === "Bronze Pog").length;
    const silverCount = inventory.filter(item => item.name === "Silver Pog").length;
    const goldCount = inventory.filter(item => item.name === "Gold Pog").length;
    const diamondCount = inventory.filter(item => item.name === "Diamond Pog").length;
    const astralCount = inventory.filter(item => item.name === "Astral Pog").length;

    const emptySlot = Isize - inventory.length;

    // set inventory html
    // .filter is used to get the search and .includes to check if the item name includes the searched text
    requestAnimationFrame(() => {
        inventoryDiv.innerHTML = inventory.filter(item => item.name.toLowerCase().includes(itemSearched)).map((item, index) => {
            return hasBonus = highlightColors.includes(item.name),
                multiplier = perNameBonus[item.name] ?? 1,
                showMultiplier = multiplier > 1 ? ` x${multiplier.toFixed(2)}` : "",
                namelength = item.name.length,
                sellvalue = Math.round((item.income * 2.94 * (level / 1.6))**((level / 100) + 1)),
                unique = item.rarity === "Unique",
                selected = item.id === selectedID,
                // refernce this inside the map function, for item is only defined in here
                isBronze = item.name === "Bronze Pog",
                isSilver = item.name === "Silver Pog",
                isGold = item.name === "Gold Pog",
                isDiamond = item.name === "Diamond Pog",
                isAstral = item.name === "Astral Pog",
                isGod = item.name === "God Pog",
                // how many bronze pogs are there? (mergAmount)
                //bronze
                bronze = isBronze && bronzeCount >= mergeAmount,
                //silver
                silver = isSilver && silverCount >= mergeAmount,
                //gold
                gold = isGold && goldCount >= mergeAmount,
                //diamond
                diamond = isDiamond && diamondCount >= mergeAmount,
                //astral from vamy
                astral = isAstral && astralCount >= mergeAmount,
                // show merge button
                canMerge = bronze || silver || gold || diamond || astral,
                // show trade button
                canTrade = item.name === "Dragon Ball",
                // return html
                `<div data-index=${index} data-id=${item.id} class="item ${hasBonus ? 'highlight' : ''} ${item.locked ? 'locked' : ''} ${selected ? 'select' : ''}">
                <div id="lock-bc" onclick="lock(${item.id})" style="opacity: ${item.locked ? 1 : 0}; background-color: ${item.locked ? "white" : "rgba(200, 200, 200, 1)"}">
                    <img id="lock" src="../static/icons/buttons_main/lock.png" width="22" height="24" title="Lock (can't be sold when locked)">
                </div>
                <img
                    class="pogImg" 
                    src="../static/icons/images/pogs/${item.code2}.webp" 
                    width="50" 
                    height="50" 
                    loading="eager" 
                    decoding="async" 
                >
                <h2 class="multiplier" style="display: ${multiplier > 1 ? "block" : "none"}">${showMultiplier}</h2>
                <br>
                ${canMerge ? `<button style="z-index: 2" class="mergebtn" onclick="merge(${isBronze}, ${isSilver}, ${isGold}, ${isDiamond}, ${isAstral})">Merge (${mergeAmount})</button>` : ""}
                ${canTrade ? `<button style="z-index: 2" class="mergebtn" onclick="trade(${item.id}, ${item.locked})">Trade (1)</button>` : ""}
            </div>`;
        }).join("");
    });
requestAnimationFrame(() => {
    inventoryDiv.innerHTML = inventoryDiv.innerHTML +
        // add empty slots
        Array.from({ length: emptySlot }, (_, i) => `<div class="emptySlot"></div>`).join("") +
        //add buy slot button
        (Isize >= 100 ? '' : `<div id="buySlot">+</div>`);
});
// Get tradeable items from inventory
const tradeableItems = inventory.filter(item => item.rarity !== "Unique");
// Bind the buy slot handler after the DOM update (ensure #buySlot exists)
requestAnimationFrame(() => {
    bindBuySlot();
});
}