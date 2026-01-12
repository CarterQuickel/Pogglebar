//search functionality
document.getElementById("searchbtn").addEventListener("click", () => {
    box = document.getElementById("searchbox")
    inv = document.getElementById("inventory")
    searching = true;
    document.getElementById("descPanel").innerHTML = "";
    if (searching) {
        itemSearched = box.value.toLowerCase();
        refreshInventory();
    }
});

//categorize functionality
document.getElementById("selectSort").addEventListener("change", () => {
    sorting();
    refreshInventory();
    save();
});

function sorting() {
    const sortBy = document.getElementById("selectSort").value;
    inventory = Object.values(inventory);
    const rarityOrder = { 'Otherworldly': 7, 'Unique': 6, 'Mythic': 5, 'Rare': 4, 'Uncommon': 3, 'Common': 2, 'Trash': 1 };
    if (sortBy === "rarityHf") {
        inventory.sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
    } else if (sortBy === "rarityLf") {
        inventory.sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity]);
    } else if (sortBy === "nameAZ") {
        inventory.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "nameZA") {
        inventory.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === "svHf") {
        inventory.sort((a, b) => (Math.round(b.income * 1.05)) - (Math.round(a.income * 1.05)));
    } else if (sortBy === "svLf") {
        inventory.sort((a, b) => (Math.round(a.income * 1.05)) - (Math.round(b.income * 1.05)));
    }
}

// search variables
let searching = false;
let itemSearched = "";

// clear search every 100ms if box is empty
setInterval(() => {
    if (itemSearched === "") {
        searching = false;
    }
}, 100);

sorting();