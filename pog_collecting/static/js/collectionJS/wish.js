
function customConfirm(message) {
    return new Promise((resolve) => {
        const confirmBox = document.getElementById("customConfirm");
        const confirmMessage = document.getElementById("confirmMessage");
        const confirmYes = document.getElementById("customConfirmYes");
        const confirmNo = document.getElementById("customConfirmNo");

        confirmMessage.textContent = message;
        confirmBox.style.display = "block";

        confirmYes.onclick = () => {
            confirmBox.style.display = "none";
            resolve(true);
        };

        confirmNo.onclick = () => {
            confirmBox.style.display = "none";
            resolve(false);
        };
    }
    )
};

document.getElementById("useWish").addEventListener("click", async () => {
    if (wish >= 7) {
        let wealth = await customConfirm("Wish of Wealth: Use wish to gain a large amount of money?");
        if (wealth) {
            money += Math.floor(money * 3.5);
            wish -= 7;
            save();
        } else {
            let power = await customConfirm("Wish of Power: Use wish to gain decreased crate costs?");
            if (power) {
                for (let crate in crates) {
                    crates[crate].price = Math.floor(crates[crate].price * 0.95);
                }
                wish -= 7;
                save();
            } else {
                let wisdom = await customConfirm("Wish of Wisdom: Use wish to gain a large amount of XP?");
                if (wisdom) {
                    xp += Math.floor(maxXP * 1.5);
                    levelup();
                    wish -= 7;
                    save();
                } else {
                    await customConfirm("No wish was used.");
                }
            }
        }
    } else {
        await customConfirm("Not enough wishes to grant a wish.")
    }
});