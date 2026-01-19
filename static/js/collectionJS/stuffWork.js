// reference userdata from ejs
var userdata = JSON.parse(document.getElementById("userdata").textContent);
// ensure a global achievements object exists early so other scripts can read it
window.achievements = window.achievements || userdata.achievements || [];
// reference pogs from ejs
var maxPogs = JSON.parse(document.getElementById("maxPogs").textContent);
// reference pogs from ejs
var pogList = JSON.parse(document.getElementById("pogList").textContent);

// pogiedia rarity defining
rarityColor = [
    { name: "Trash", color: "red", income: 4 }, //trash
    { name: "Common", color: "yellow", income: 15 }, //common
    { name: "Uncommon", color: "lime", income: 27 }, //uncommon
    { name: "Mythic", color: "fuchsia", income: 63 }, //mythic
    { name: "Unique", color: "lightgray", income: 134 }, //unique
]

// used for crate display
let enabledCrate = false;

// pfp 
let pfpimg = userdata.pfp || ""
document.getElementById("userPic").src = pfpimg;
document.getElementById("bigpfp").src = pfpimg;

//selected pog
selectedID = 0;

// wish
let wish = userdata.wish || 0;

// money upgrade
let moneyTick = 1000;

// items
let inventory = userdata.inventory || [];
window.inventory = inventory;

//crates opened
cratesOpened = userdata.cratesOpened || 0;

// money
let money = userdata.score || 300;
let userIncome = userdata.income || 0;
let totalSold = userdata.totalSold || 0;

// pogAmount
let pogAmount = userdata.pogamount || [];
let maxBinder = 0;

// XP
let xp = userdata.xp || 0;
let maxXP = userdata.maxxp || 30;
let level = userdata.level || 1;

// merge
const mergeAmount = 5;
let mergeCount = userdata.mergeCount || 0;

// global vari
window.mergeCount = mergeCount;
userdata.mergeCount = mergeCount;

// combo tracking
let comboCount = 0;
let highestCombo = userdata.highestCombo || 0;
window.highestCombo = highestCombo;
userdata.highestCombo = highestCombo;

// inventory size
let Isize = userdata.Isize || 45;

// bonus multiplier
let bonusMulti = 1;

// abbreviation num
let abbreviatedMoney = 0;

// button referne
const buttons = document.getElementsByTagName("button");

// first time call
refreshInventory();

// display the highest combo
highestCombo = computeComboStats();

// corrects stats on load
computeComboStats(); 

// lock items
function lock(id) {
    const index = inventory.findIndex(item => item.id === id)
    inventory[index].locked = !inventory[index].locked;
    refreshInventory();
    save();
}

//trade for 1/7 wish
function trade(id, locked) {
    if (!locked) {
        const index = inventory.findIndex(item => item.id === id);
        inventory.splice(index, 1);
        wish++;
        userIncome = getTotalIncome();
        refreshInventory();
        save();
    }
    document.getElementById("descPanel").innerHTML = "";
}

// color key toggle
document.getElementById("colors").addEventListener("click", () => {
    const colorKey = document.getElementById("colorKey")
    const isVisible = colorKey.style.display === "flex";
    colorKey.style.display = isVisible ? "none" : "flex";
})

//report
document.getElementById("help").addEventListener("click", () => {
    window.open("https://github.com/CarterQuickel/Pogglebar/issues", "_blank");
});

// number abbreviation function
function abbreviateNumber(value) {
    const formatter = Intl.NumberFormat('en', { notation: 'compact', compactDisplay: 'short' });
    return formatter.format(value);
}