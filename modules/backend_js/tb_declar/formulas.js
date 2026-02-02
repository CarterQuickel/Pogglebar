const speed = 0
const def = 0
const atk = 0
const critRate = 5
const critDmg = 50
let finalDmg = 0

let dmg = atk/5

let incomingDmg = dmg - (dmg * (def/10000))

let actionValue = (10000/speed)

function rollCrit(critRate) {
    const rate = Math.max(0, Math.min(100, critRate));
    return Math.random() * 100 < rate; 
}

if (rollCrit(critRate)) {
    finalDmg = incomingDmg * (1 + (critDmg / 100))
} else {
    finalDmg = incomingDmg
}