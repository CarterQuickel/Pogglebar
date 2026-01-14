// Backend user state and initialization
function initializeUserState(userData) {
  return {
    money: userData.score || 300,
    userIncome: userData.income || 0,
    totalSold: userData.totalSold || 0,
    inventory: userData.inventory || [],
    pogAmount: userData.pogamount || [],
    xp: userData.xp || 0,
    maxXP: userData.maxxp || 30,
    level: userData.level || 1,
    mergeCount: userData.mergeCount || 0,
    highestCombo: userData.highestCombo || 0,
    Isize: userData.Isize || 45,
    pfp: userData.pfp || '',
    wish: userData.wish || 0,
    cratesOpened: userData.cratesOpened || 0,
    achievements: userData.achievements || []
  };
}

const RARITY_COLORS = [
  { name: "Trash", color: "red", income: 4 },
  { name: "Common", color: "yellow", income: 15 },
  { name: "Uncommon", color: "lime", income: 27 },
  { name: "Mythic", color: "fuchsia", income: 63 },
  { name: "Unique", color: "lightgray", income: 134 }
];

module.exports = { initializeUserState, RARITY_COLORS };