document.getElementById("shopBtn").addEventListener("click", () => {
    const shop = document.getElementById("shopBanner");
    shop.style.display = "block";
});

document.getElementById("closeShop").addEventListener("click", () => {
    const shop = document.getElementById("shopBanner");
    shop.style.display = "none";
    document.getElementById("transConf").style.display = "none";
});

// default transaction
let defprice = 0
let defreason = ""

//shop items
let shopHTML = shopitems.map((item) => {
    const categoryName = item.category;
    const categoryItems = item.items;
    return `
    <h3 id="cateName">${categoryName}</h3>
    <div id="itemsCont">
        <div class="itemTag">
            <h3>${categoryItems && categoryItems[0] ? categoryItems[0].name : 'Error Rendering'}</h3>
            <p>${categoryItems[0].description}</p>
            <br>
            <button class="buyBtn" onclick="transaction(${categoryItems[0].price}, '${categoryItems[0].name.replace(/'/g, "\\'")}')">${categoryItems[0].price} Digipogs</button>
        </div>
        <div class="itemTag">
            <h3>${categoryItems && categoryItems[1] ? categoryItems[1].name : 'Error Rendering'}</h3>
            <p>${categoryItems[1].description}</p>
            <br>
            <button class="buyBtn" onclick="transaction(${categoryItems[1].price}, '${categoryItems[1].name.replace(/'/g, "\\'")}')">${categoryItems[1].price} Digipogs</button>
        </div>
        <div class="itemTag">
            <h3>${categoryItems && categoryItems[2] ? categoryItems[2].name : 'Error Rendering'}</h3>
            <p>${categoryItems[2].description}</p>
            <br>
            <button class="buyBtn" onclick="transaction(${categoryItems[2].price}, '${categoryItems[2].name.replace(/'/g, "\\'")}')">${categoryItems[2].price} Digipogs</button>
        </div>
    </div>
    `
}).join('');

document.getElementById("shopItems").innerHTML = shopHTML;

function transaction(price, reason) {
    document.getElementById("transConf").style.display = "block";
    defprice = price;
    defreason = reason;
}

document.getElementById("purchaseBtn").addEventListener("click", () => {
    const pinval = document.getElementById("pinField").value;
    purchase(defprice, defreason, pinval);
    document.getElementById("transConf").style.display = "none";
});

document.getElementById("cancelBtn").addEventListener("click", () => {
    document.getElementById("transConf").style.display = "none";
});

// implement purchased item effect
function implement(reason) {
    if (reason === "1 Wish") {
        wish++;
    } else if (reason === "5 Wishes") {
        wish += 5;
    } else if (reason === "10 Wishes") {
        wish += 10;
    } else if (reason === "$100K") {
        money += 100000;
    } else if (reason === "$1M") {
        money += 1000000;
    } else if (reason === "$10M") {
        money += 10000000;
    } else if (reason === "1 Slot") {
        Isize += 1;
    } else if (reason === "5 Slots") {
        Isize += 5;
    } else if (reason === "10 Slots") {
        Isize += 10;
    } else if (reason === "Double Money") {
        userIncome *= 2;
    } else if (reason === "Double XP") {
        xp *= 2;
        levelup();
    } else if (reason === "Half Crate Costs") {
        for (let crate in crates) {
            crates[crate].price = Math.floor(crates[crate].price * 0.5);
        }
    } else if (reason === "Common Pog") {
        const id = Math.random() * 100000
        inventory.push({
            locked: false,
            pogid: 0,
            name: "SW",
            pogcol: "Grey & Black",
            color: "yellow",
            income: 15,
            value: "Common",
            id: id,
            description: "This Pog was created to represent the York Tech 2022-2023 class of Computer Software.",
            creator: "Mr. Smith"
        });
        refreshInventory();
    } else if (reason === "Mythical Pog") {
        const id = Math.random() * 100000
        inventory.push({
            locked: false,
            pogid: 0,
            name: "Fallout",
            pogcol: "Iridescent",
            color: "purple",
            income: 63,
            value: "Mythic",
            id: id,
            description: "Based on a vault door in fallout character Vault Boy.",
            creator: "Mr. Smith"
        });
        refreshInventory();
    } else if (reason === "Bronze Pog") {
        const id = Math.random() * 100000
        inventory.push({ 
            pogid: 286, 
            name: "Silver Pog", 
            pogcol: "Silver", 
            color: "orange", 
            income: 620, 
            value: "Unique", 
            id: Math.random() * 100000, 
            description: "A pog made from pure silver.", 
            creator: "Silversmith" });
        refreshInventory();
    }
}

//buy buttons
function purchase(price, reason, pin) {
    fetch('/api/digipogs/transfer', {
        // post is to use app.post with the route /api/digipogs/transfer
        method: 'POST',
        // credentials include to send cookies
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            price: price,
            reason: `Pogglebar - ${reason}`,
            pin: pin
        })
    }).then(response => response.json())
        .then(data => {
            if (data.success) {
                // add purchased item effect here
                implement(reason);
                save();
                alert(`Purchase successful: ${reason}`);
            } else {
                alert(`Purchase failed: ${data.message}`);
            }
        })
        .catch(err => {
            console.error("Error during purchase:", err);
        })
}