//sell all button
document.getElementById("sellAll").addEventListener("click", () => {
    confirmation = confirm(`Are you sure you want to sell all ${searching ? "searched " : ""}items in your inventory?`);
    if (confirmation == false) {
        return;
    }
    save()
    if (!searching) {
        const initialInv = inventory.length
        for (let i = initialInv - 1; i >= 0; i--) {
            if (inventory[i].locked) {
                console.log(`Item sold at index: ${i} (name: ${inventory[i].name}), and lock is: ${inventory[i].locked}`)
                continue;
            }
            if (inventory.length == 0) {
                break;
            }
            console.log(`Item sold at index: ${i} (name: ${inventory[i].name}), and lock is: ${inventory[i].locked}`)
            sellItem(inventory[i].id, Math.round((inventory[i].income * 2.94 * (level / 1.6))**((level / 100) + 1)), inventory[i].locked)
        }
    } else {
        const filteredItems = inventory.filter(item => item.name.toLowerCase().includes(itemSearched));
        const initialInv = filteredItems.length;
        for (let i = initialInv - 1; i >= 0; i--) {
            const item = filteredItems[i];
            const indexInInventory = inventory.findIndex(invItem => invItem.id === item.id);
            if (item.locked) {
                continue;
            }
            if (indexInInventory !== -1) {
                sellItem(item.id, Math.round((item.income * 2.94 * (level / 1.6))**((level / 100) + 1)), item.locked); //sellvalue
            }
        }
    }
    userIncome = getTotalIncome();
});