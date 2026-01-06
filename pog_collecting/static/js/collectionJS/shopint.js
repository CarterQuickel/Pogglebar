// default transaction
let defprice = 0
let defamount = 0
let defreason = ""

function transferType() {
    const balanceType = document.getElementById("balanceSelect").value;
    if (balanceType === "money") {
        return "Money";
    } else if (balanceType === "digi") {
        return "Digipogs";
    }
}

function transaction(price, reason, amount) {
    if (!validateCrateOpening(price, amount)) return;
    document.getElementById("transConf").style.display = "block";
    defprice = price;
    defreason = reason;
    defamount = amount;
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
    const type = transferType();
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