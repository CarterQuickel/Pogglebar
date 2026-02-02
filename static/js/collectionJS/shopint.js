// default transaction
let defprice = 0
// the price for the true transaction
let defrealprice = 0
let defamount = 0
let defreason = ""

// CRATE TRANSACTIONS
function transferType() {
    const balanceType = document.getElementById("balanceSelect").value;
    if (balanceType === "money") {
        return "Money";
    } else if (balanceType === "digi") {
        return "Digipogs";
    }
}

document.getElementById("amountSelect").addEventListener("change", () => {
    const price = defprice;
    const amount = parseInt(document.getElementById("amountSelect").value);
    determineCost(price, amount);
    defamount = amount;
});

document.getElementById("balanceSelect").addEventListener("change", () => {
    const type = transferType();
    if (type === "Money") {
        document.getElementById("pin_crate").style.display = "none";
    } else if (type === "Digipogs") {
        document.getElementById("pin_crate").style.display = "block";
    }
    determineCost(defprice, defamount);
});

//price determination
function determineCost(price, amount) {
    const type = transferType();
    let monies = true;
    if (type === "Money") {
        monies = true; 
    } else if (type === "Digipogs") {
        monies = false;
    }
    const scaling = ((1 + (cratesOpened / 20)));
    const scaling_perc = (scaling * 100) - 100;
    const purchaseCost = monies ? price * amount * scaling : (price * amount) / 5; // money : digipogs
    document.getElementById("crateprice").innerText = `Price: $${abbreviateNumber(purchaseCost)} ${monies ? `(+${scaling_perc.toFixed(0)}%)` : ``}`;
    defrealprice = purchaseCost;
    console.log(defrealprice);
    return purchaseCost;
};

//purchasing functions
function transaction(price, reason) {
    const count = parseInt(document.getElementById("amountSelect").value);
    // determine total price
    determineCost(price, count);
    // open transaction confirmation modal
    document.getElementById("overlay").style.display = "block";
    // variable definitions for later use
    defprice = price;
    defreason = reason;
    defamount = count;
}

document.getElementById("purchaseBtn_C").addEventListener("click", () => {
    const count = parseInt(document.getElementById("amountSelect").value);
    const type = transferType();
    if (!validateCrateOpening(type, defrealprice, count)) return;
    const pinval = document.getElementById("pinField_crate").value;
    purchase(defrealprice, defreason, pinval, defamount);
    document.getElementById("overlay").style.display = "none";
});

document.getElementById("cancelBtn_C").addEventListener("click", () => {
    document.getElementById("overlay").style.display = "none";
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
    const type = transferType();
    console.log(price);
    if (type === "Money") {
        money -= price;
        implement(price, reason, amount);
        save();
    } else if (type === "Digipogs") {
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
    };
};

/* !
!
!
!
!
!
!
!
! SLOT TRANSACTIONS BELOW */
document.getElementById("cancelBtn_S").addEventListener("click", () => {
    document.getElementById("slotOver").style.display = "none";
});

document.getElementById("slotAmount").addEventListener("change", () => {
    const amount = parseInt(document.getElementById("slotAmount").value);
    const slotPrice = calcSlot(amount);
    document.getElementById("slotprice").innerText = `Price: $${abbreviateNumber(slotPrice)}`;
});

document.getElementById("purchaseBtn_S").addEventListener("click", () => {
    const amount = parseInt(document.getElementById("slotAmount").value);
    const slotPrice = calcSlot(amount);
    const pinval = document.getElementById("pinField_slot").value;
    purchaseSlots(slotPrice, "Slots", pinval, amount);
    document.getElementById("slotOver").style.display = "none";
});

//buy slots function
function purchaseSlots(price, reason, pin, amount) {
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
                Isize += amount;
                refreshInventory();
                save();
                alert(`Purchase successful! (-${price} Digipogs)`);
            } else {
                alert(`Purchase failed: ${data.message}`);
            }
        })
        .catch(err => {
            console.error("Error during purchase:", err);
        })
};