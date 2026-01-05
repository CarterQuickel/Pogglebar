// reference userdata from ejs
var userdata = JSON.parse(document.getElementById("userdata").textContent);
/* READ THIS BEFORE MAKING CHANGES:

!
!
!
!
!
!
!

CRATE DATA UPDATED IN HERE MUST BE UPDATED IN APP.JS UNTIL MODULES ARE COMPLETED */
let crates = userdata?.crates && Array.isArray(userdata.crates) ? userdata.crates || 
[
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
            {
                name: "Unique",
                chance: 0.00
            }
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
            {
                name: "Unique",
                chance: 0.00
            }
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
            {
                name: "Unique",
                chance: 0.00
            }
        ]
    },
    {
        name: "risky crate",
        price: 10000,
        rarities: [
            {
                name: "Trash",
                chance: 0.0
            },
            {
                name: "Common",
                chance: 0.5
            },
            {
                name: "Uncommon",
                chance: 0.0
            },
            {
                name: "Rare",
                chance: 0.5
            },
            {
                name: "Mythic",
                chance: 0.0
            },
            {
                name: "Unique",
                chance: 0.0
            }
        ]
    },
    {
        name: "godly crate",
        price: 5000,
        rarities: [
            {
                name: "Trash",
                chance: 0.0
            },
            {
                name: "Common",
                chance: 0.38    // lowered a bit
            },
            {
                name: "Uncommon",
                chance: 0.0
            },
            {
                name: "Rare",
                chance: 0.0
            },
            {
                name: "Mythic",
                chance: 0.51    // adjusted
            },
            {
                name: "Unique",
                chance: 0.11    // new tiny chance for Unique
            }
        ]
    }
] : [];