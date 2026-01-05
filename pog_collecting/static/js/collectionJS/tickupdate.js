// update loop
setInterval(update, 100);
function update() {
    // update inventory size text
    document.getElementById("space").innerHTML = `${inventory.length}/${Isize}`;

    // update XP Txt
    document.getElementById("XPTxt").innerText = `Level ${level}`;

    // update income Txt
    document.getElementById("income").innerText = `($${abbreviateNumber(getTotalIncome())}/s)`;

    //update pog / pog
    document.getElementById("pogCount").innerText = `Pogs Discovered: ${pogAmount.length} / ${maxBinder}`;

    //update pogs color
    document.getElementById("pogCount").style.color = pogAmount.length >= maxBinder ? "gold" : "white";

    //update wish text
    document.getElementById("useWish").innerText = `Wish \n (${wish} / 7)`;

    //crate 1 text
    document.getElementById("crate1").innerHTML = `Trash Crate ($${abbreviateNumber(crates[0].price)})`;

    //crate 2 text
    document.getElementById("crate2").innerHTML = `Common Crate ($${abbreviateNumber(crates[1].price)})`;

    //crate 3 text
    document.getElementById("crate3").innerHTML = `Uncommon Crate ($${abbreviateNumber(crates[2].price)})`;

    //crate 4 text
    document.getElementById("crate4").innerHTML = `Rare Crate ($${abbreviateNumber(crates[3].price)})`;

    //crate 5 text
    document.getElementById("crate5").innerHTML = `Mythic Crate ($${abbreviateNumber(crates[4].price)})`;

    //sell all button
    document.getElementById("sellAll").innerText = `Sell All ${searching ? "(Searched)" : ""}`;

    //sell all width
    document.getElementById("sellAll").style.width = searching ? "150px" : "100px";

    if (inventory.length >= 999) {
        while (inventory.length > 999) {
            const item = inventory[0];
            sellItem(item.id, Math.round(item.income * 1.05), false);
        }
    }

    // change inventory text color if full
    if (inventory.length >= Isize) {
        document.getElementById("space").style.color = "red";
    } else {
        document.getElementById("space").style.color = "#ecdcdc";
    }
}

// initial money display
setInterval(updateMoney, 100);
function updateMoney() {
    const abbreviatedMoney = abbreviateNumber(money);
    document.getElementById("money").innerText = `$${abbreviatedMoney}`;
}

//update progress bar
setInterval(updatePB, 100)
function updatePB() {
    const XPPB = document.getElementById("XPPB")
    XPPB.value = xp;
    XPPB.max = maxXP;
}

setInterval(updatecrates, 100);
function updatecrates() {
    const crateButtons = document.getElementsByClassName("crate");
    for (let i = 0; i < crateButtons.length; i++) {
        let buym5 = document.getElementById(`crate${i+1}_b5`)
        let buym10 = document.getElementById(`crate${i+1}_b10`)
        // Access price from the crates array at the current index
        let currentPrice = crates[i].price; 
        // Disable individual button if money is less than its price
        if (money < currentPrice || inventory.length == Isize || inventory.length >= 999) {
            crateButtons[i].disabled = true;
            buym5.disabled = true;
            buym10.disabled = true;
        } else {
            crateButtons[i].disabled = false;
            buym5.disabled = false;
            buym10.disabled = false;
        }
    }
}
