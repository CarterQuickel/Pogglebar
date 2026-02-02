const classes = [
    {
        name: "Tank",
        desc: "A tank unit will reduce your teams overall INCOMING damage.",
        subclass: {
            name: "shielder", //EX. Aventurine
            desc: "Provides overheal to allies.",
            prop: {
                health: 2500,
                def: 2800,
                
                speed: 100,
                atk: 1000
            },
            name: "Absorber", //EX. Fu Xuan 
            desc: "Reduces all allies' damage taken significantly and takes the damage themself at a reduced amount.",
            prop: {
                health: 5500,
                def: 1500,
                speed: 120,
                atk: 1000
            }
        },
    },
    {
        name: "DPS",
        desc: "A DPS unit will increase your teams overall DAMAGE output.",
        prop: {
            health: 2000,
            def: 1000,
            speed: 150,
            atk: 3000
        }
    }
]