function merge(bronze, silver, gold, diamond, astral) {
    let sold = 0;
    mergeCount += 1;
    //syncing global variable with session variable
    window.mergeCount = mergeCount;
    userdata.mergeCount = mergeCount;

    // add new  pog to inventory
    if (bronze) {
        inventory.push({ locked: false, pogid: 286, name: "Silver Pog", pogcol: "Silver", color: "lightgray", income: 620, rarity: "Unique", id: Date.now() + Math.floor(Math.random() * 10000), description: "A pog made from pure silver.", creator: "Silversmith" });
    } else if (silver) {
        inventory.push({ locked: false, pogid: 287, name: "Gold Pog", pogcol: "Gold", color: "lightgray", income: 7400, rarity: "Unique", id: Date.now() + Math.floor(Math.random() * 10000), description: "A pog made from pure gold.", creator: "King Midas" });
    } else if (gold) {
        inventory.push({ locked: false, pogid: 288, name: "Diamond Pog", pogcol: "Diamond", color: "lightgray", income: 83000, rarity: "Unique", id: Date.now() + Math.floor(Math.random() * 10000), description: "A pog made from the hardest material on Earth.", creator: "Gemmaster" });
    } else if (diamond) {
        inventory.push({ locked: false, pogid: 289, name: "Astral Pog", pogcol: "Astral", color: "lightgray", income: 1000000, rarity: "Unique", id: Date.now() + Math.floor(Math.random() * 10000), description: "A pog infused with the power of the stars.", creator: "Celestial Smith" });
    } else if (astral) {
        inventory.push({ locked: false, pogid: 290, name: "God Pog", pogcol: "White", color: "black", income: 694206741, rarity: "Otherworldly", id: Date.now() + Math.floor(Math.random() * 10000), description: "The ultimate pog, said to be created by the gods themselves.", creator: "Ancient Deity" });
    }
    // only sell the amount needed
    for (let i = 0; i < inventory.length && sold < mergeAmount; i++) {
        if (inventory[i].name === "Bronze Pog" && bronze) {
            sellItem(inventory[i].id, 0, false);
            sold++;
            i--;
        } else if (inventory[i].name === "Silver Pog" && silver) {
            sellItem(inventory[i].id, 0, false);
            sold++;
            i--;
        } else if (inventory[i].name === "Gold Pog" && gold) {
            sellItem(inventory[i].id, 0, false);
            sold++;
            i--;
        } else if (inventory[i].name === "Diamond Pog" && diamond) {
            sellItem(inventory[i].id, 0, false);
            sold++;
            i--;
        } else if (inventory[i].name === "Astral Pog" && astral) {
            sellItem(inventory[i].id, 0, false);
            sold++;
            i--;
        }
    }
    userIncome = getTotalIncome();
    sorting();
    save();
    if (window.checkAllAchievements) window.checkAllAchievements();
}