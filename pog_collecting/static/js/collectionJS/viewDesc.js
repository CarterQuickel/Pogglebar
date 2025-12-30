document.getElementById("inventory").addEventListener("click", (e) => {
    /* closest much be used to get newly added items.
    By default, if only using an event listener, the newly added items don't gain event listeners until refreshed.*/
    const itemDiv = e.target.closest(".item");
    if (!itemDiv) return;

    const index = itemDiv.dataset.index;
    const item = inventory[index];
    let sellvalue = Math.round((item.income * 2.94 * (level / 1.6))**((level / 100) + 1));
    selectedID = item.id;
    refreshInventory();
    viewDesc(
        index,
        item.name,
        item.locked,
        item.rarity,
        item.id,
        item.pogid,
        item.pogcol,
        item.creator,
        item.description,
        item.income,
        sellvalue
    )
});

//might use pogid and their color and creator down the line, unsure yet
function viewDesc(index, name, locked, rarity, id, pogid, color, creator, desc, income, value) {
    const panel = document.getElementById("descPanel");
    const ab_value = abbreviateNumber(value);
    panel.innerHTML = `
    <h3 id="headerName">(${parseInt(index) + 1}) ${name}</h3>
    <div id="money-info">
        <strong class="moneytxt">$${abbreviateNumber(Math.round(income * ((window.perNameBonus && window.perNameBonus[name])) || 1))}/s</strong><br>
        <strong class="moneytxt">$${ab_value}</strong><br>
    </div>
    <p>${desc}</p>
    <button id="sellbtn" style="filter: brightness(${locked ? 0.6 : 1}); pointer-events: ${locked ? "none" : "auto"}"onclick="sellItem(${id}, ${sellvalue}, ${locked})">${locked ? "Locked" : "Sell"}</button>
    `;
}