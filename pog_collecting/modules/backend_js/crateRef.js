//crate reference data
const crateRef = [
    {
        name: "simple crate",
        price: 100,
        rarities: [
            {
                name: "Trash",
                chance: 0.59
            },
            {
                name: "Common",
                chance: 0.2
            },
            {
                name: "Uncommon",
                chance: 0.15
            },
            {
                name: "Rare",
                chance: 0.0
            },
            {
                name: "Mythic",
                chance: 0.06
            },
        ]
    },
    {
        name: "big crate",
        price: 500,
        rarities: [
            {
                name: "Trash",
                chance: 0.0
            },
            {
                name: "Common",
                chance: 0.6
            },
            {
                name: "Uncommon",
                chance: 0.16
            },
            {
                name: "Rare",
                chance: 0.13
            },
            {
                name: "Mythic",
                chance: 0.11
            },
        ]
    },
    {
        name: "epic crate",
        price: 1000,
        rarities: [
            {
                name: "Trash",
                chance: 0.0
            },
            {
                name: "Common",
                chance: 0.4
            },
            {
                name: "Uncommon",
                chance: 0.27
            },
            {
                name: "Rare",
                chance: 0.21
            },
            {
                name: "Mythic",
                chance: 0.12
            },
        ]
    },
    {
        name: "rare crate",
        price: 5000,
        rarities: [
            {
                name: "Trash",
                chance: 0.1
            },
            {
                name: "Common",
                chance: 0.25
            },
            {
                name: "Uncommon",
                chance: 0.20
            },
            {
                name: "Rare",
                chance: 0.30
            },
            {
                name: "Mythic",
                chance: 0.15
            }
        ]
    },
    {
        name: "mythic crate",
        price: 7000,
        rarities: [
            {
                name: "Trash",
                chance: 0.0
            },
            {
                name: "Common",
                chance: 0.025   // lowered a bit
            },
            {
                name: "Uncommon",
                chance: 0.15    // unchanged
            },
            {
                name: "Rare",
                chance: 0.32    // increased a bit
            },
            {
                name: "Mythic",
                chance: 0.5    // adjusted
            },
            {
                name: "Unique",
                chance: 0.005    // new tiny chance for Unique
            }
        ]
    }
]

module.exports = crateRef;