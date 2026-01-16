const perks = [
    {
        name: "Critcal Strike",
        description: "Prioritized target takes +5% damage per hit target.",
        type: "attack",
        notches: 1
    },
    {
        name: "Element Inflcitor",
        description: "Basic attacks have a 10% chance to buildup a random elemental effect.",
        type: "element",
        notches: 1
    },
    {
        name: "Attack+",
        description: "Attack increased by 4%.",
        type: "attack",
        notches: 1
    },
    {
        name: "Resistance+",
        description: "Raise defense by 6%.",
        type: "defense",
        notches: 2
    },
    {
        name: "Resnonance",
        description: "Attacks inflict twice, but only with 20% damage.",
        type: "attack",
        notches: 2
    },
    {
        name: "Vow Against",
        description: "Gain 3% of damage back as health.",
        type: "support",
        notches: 2
    },
    {
        name: "Forged Fury",
        description: "Increase damage by 15% when health is below 35%.",
        type: "attack",
        notches: 3
    },
    {
        name: "Incantation Wizard",
        description: "Over-time elements last an extra turn.",
        type: "element",
        notches: 3
    },
    {
        name: "Unveil",
        description: "Killing a target grants back 6% of unit's max health.",
        type: "support",
        notches: 4
    },
    {
        name: "Elemental Block",
        description: "Reduces elemental effect hit rate by 12%.",
        type: "defense",
        notches: 2
    },
    {
        name: "Last Stand",
        description: "When health is less than 30%, ultimate gets charged by 65%.",
        type: "support",
        notches: 4
    },
    {
        name: "Pierce",
        description: "Attacks ignore 20% of the target's defense.",
        type: "attack",
        notches: 3
    },
    {
        name: "Inflictor's Bane",
        description: "Over-time element effects deal an extra 30% damage per turn.",
        type: "element",
        notches: 3
    },
    {
        name: "Medic",
        description: "Receive 20% more healing from all sources.",
        type: "support",
        notches: 3
    },
    {
        name: "Thorns",
        description: "Damage received reflects 20% of unit's defense back to the attacker.",
        type: "defense",
        notches: 4
    },
    {
        name: "Heaviest Grudge",
        description: "An enemy's skill attacks will cast a random element unto them when attacking this unit.",
        type: "defense",
        notches: 6
    },
    {
        name: "Walking Nuke",
        description: "Attack stat is set to 0, but all attacks inflict AOE damage over time.",
        type: "attack",
        notches: 6
    },
    {
        name: "Ricochet",
        description: "Basic attacks are set to bounce up to 4 additional targets.",
        type: "attack",
        notches: 5
    },
    {
        name: "Samurai",
        description: "Bleed can stack up to 8x and increases unit speed by 20%.",
        type: "attack",
        notches: 6
    },
    {
        name: "Health for Attack",
        description: "Attack and Defense attributes swap.",
        type: "utility",
        notches: 3
    },
    {
        name: "Eye for an Eye",
        description: "Lose 2 perk notches but gain 2 equipment slots.",
        type: "utility",
        notches: 0
    },
    {
        name: "Aye for an Aye",
        description: "Gain 2 perk slots but lose 2 equipment slots.",
        type: "utility",
        notches: 0
    },
    {
        name: "Half-hearted",
        description: "Only have 50% the maximum health, but skill attacks do 30% more damage.",
        type: "attack",
        notches: 5
    },
    {
        name: "Avenge the Fallen",
        description: "Basic attacks do +4% damage for every ally defeated.",
        type: "attack",
        notches: 5
    },
    {
        name: "Weighed Down",
        description: "Slow effects increased by 16% and unit gains 50% slow resistance.",
        type: "element",
        notches: 4
    },
    {
        name: "Walking Dead",
        description: "When unit is killed, they will be revived once with 30% health.",
        type: "support",
        notches: 6
    },
    {
        name: "Swift as the Night",
        description: "Speed increased by 18%.",
        type: "utility",
        notches: 4
    },
    {
        name: "Overcharge",
        description: "Excessive healing given to this unit will convert into increased damage in their next attack.",
        type: "support",
        notches: 5
    },
    {
        name: "Health+",
        description: "Health increased by 4%.",
        type: "utility",
        notches: 1
    },
    {
        name: "Strong Spammer",
        description: "Ultimate cost decreased by 8% each time it's used.",
        type: "utility",
        notches: 3
    },
    {
        name: "Strategic Skill",
        description: "Every other turn, unit is immune to skill attacks but takes 3x damage from basic attacks.",
        type: "defense",
        notches: 5
    },
    {
        name: "Bringing it Down",
        description: "An enemy killing this unit will also be killed next turn if the killer's health was less than 50%.",
        type: "attack",
        notches: 6
    }
];

module.exports = { perks };