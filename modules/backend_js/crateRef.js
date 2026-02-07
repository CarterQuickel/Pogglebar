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
                name: "Mythic",
                chance: 0.055
            },
            {
                name: "Unique",
                chance: 0.005    // new tiny chance for Unique
            }
        ]
    },
    {
        name: "big crate",
        price: 500,
        rarities: [
            {
                name: "Trash",
                chance: 0.13
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
                name: "Mythic",
                chance: 0.1
            },
            {
                name: "Unique",
                chance: 0.01    // new tiny chance for Unique
            }
        ]
    },
    {
        name: "epic crate",
        price: 1000,
        rarities: [
            {
                name: "Trash",
                chance: 0.11
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
                name: "Mythic",
                chance: 0.2
            },
            {
                name: "Unique",
                chance: 0.02    // new tiny chance for Unique
            }
        ]
    },
    {
        name: "mythic crate",
        price: 7000,
        rarities: [
            {
                name: "Trash",
                chance: 0.09933
            },
            {
                name: "Common",
                chance: 0.18   // lowered a bit
            },
            {
                name: "Uncommon",
                chance: 0.17    // unchanged
            },
            {
                name: "Mythic",
                chance: 0.5    // adjusted
            },
            {
                name: "Unique",
                chance: 0.05    // new tiny chance for Unique
            },
            {
                name: "Otherwordly",
                chance: 0.00067    // new tiny chance for Otherwordly
            }

        ]
    }
];

module.exports = crateRef;