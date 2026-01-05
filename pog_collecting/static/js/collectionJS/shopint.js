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
let defamount = 0
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

function transaction(price, reason, amount) {
    if (!validateCrateOpening(price, amount)) return;
    document.getElementById("transConf").style.display = "block";
    defprice = price;
    defreason = JSON.stringify(reason);
    defamount = amount
}

document.getElementById("purchaseBtn").addEventListener("click", () => {
    const pinval = document.getElementById("pinField").value;
    purchase(defprice, defreason, pinval, defamount);
    document.getElementById("transConf").style.display = "none";
});

document.getElementById("cancelBtn").addEventListener("click", () => {
    document.getElementById("transConf").style.display = "none";
});

// implement purchased item effect
function implement(price, reason, amount) {
    if (amount === 1) {
        openCrateWithAnimation(price, reason);
    } else if (amount === 5) {
        openMultipleCratesWithAnimation(price, reason, 5)
    } else if (amount === 10) {
        openMultipleCratesWithAnimation(price, reason, 10)
    }
}

//buy buttons
function purchase(price, reason, pin, amount) {
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
                implement(price, reason, amount);
                save();
                alert(`Purchase successful! (-${price} Digipogs)`);
            } else {
                alert(`Purchase failed: ${data.message}`);
            }
        })
        .catch(err => {
            console.error("Error during purchase:", err);
        })
}