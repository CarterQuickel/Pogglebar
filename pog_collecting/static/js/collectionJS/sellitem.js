// sell item
function sellItem(id, sellvalue, locked) {
    if (!locked) {
        const index = inventory.findIndex(item => item.id === Number(id));
        console.log(`Selling item with id: ${id} at index: ${index} for value: $${abbreviateNumber(sellvalue)}`);
        if (index === -1) {
            console.warn(`sellItem: item with id ${id} not found in inventory`);
            return;
        }
        money += Number(sellvalue) || 0;
        totalSold++;
        inventory.splice(index, 1);
        // recalc income and refresh UI
        userIncome = getTotalIncome();
        refreshInventory();
        save();
        if (window.checkAllAchievements) window.checkAllAchievements();
    }
    document.getElementById("descPanel").innerHTML = "";
}