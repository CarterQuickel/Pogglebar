const { dot } = require("node:test/reporters");

const classes = {
    tank: {
        name: "Tank",
        desc: "Reduces incoming damage to your team",
        subclasses: {
            shielder: {
                name: "Shielder", //EX. Aventurine
                desc: "Provides overheal to allies.",
                prop: {
                    health: 2300,
                    def: 2800,
                    speed: 100,
                    atk: 1000
                }
            },
            absorber: {
                name: "Absorber", //EX. Fu Xuan
                desc: "Reduces all allies' damage taken significantly and takes the damage themself at a reduced amount.",
                prop: {
                    health: 6600,
                    def: 1500,
                    speed: 120,
                    atk: 1000
                }
            }
        }
    },
    dps: {
        name: "DPS",
        desc: "Deals high damage to enemies.",
        subclasses: {
            dot: {
                name: "Dot", //EX. Black Swan
                desc: "Applies damage over time effects to enemies.",
                prop: {
                    health: 2000,
                    def: 1500,
                    speed: 130,
                    atk: 3000
                }
            },
            hunter: {
                name: "Hunter", //EX. Archer
                desc: "Deals high single-target damage.",
                prop: {
                    health: 2500,
                    def: 1200,
                    speed: 140,
                    atk: 3200
                }
            },
            blast: {
                name: "Blast", //EX. Aglaea
                desc: "Deals damage to enemies adjacent to the main target.",
                prop: {
                    health: 3000,
                    def: 1300,
                    speed: 135,
                    atk: 2700
                }
            },
            aoe: {
                name: "AOE", //EX. The Herta
                desc: "Deals area-of-effect damage to all enemies.",
                prop: {
                    health: 2500,
                    def: 1100,
                    speed: 125,
                    atk: 2800
                }
            }
        }
    },
    support: {
        name: "Support",
        desc: "Provides buffs to allies.",
        subclasses: {
            aa: {
                name: "AA", //EX. Sunday
                desc: "Action advances allies up in action order.",
                prop: {
                    health: 3200,
                    def: 1600,
                    speed: 120,
                    atk: 1500
                }
            },
            booster: {
                name: "Booster", //EX. Tingyun
                desc: "Boosts allies' attack power.",
                prop: {
                    health: 3000,
                    def: 1400,
                    speed: 120,
                    atk: 2200
                }
            },
            zoner: {
                name: "Zoner", //EX. Tribbie
                desc: "Creates zones that allows allies to deal additional TRUE damage.",
                prop: {
                    health: 3500,
                    def: 1300,
                    speed: 90,
                    atk: 1500
                }
            }
        }
    },
    debuffer: {
        name: "Debuffer", 
        desc: "Applies debuffs to enemies.",
        subclasses: {
            weakness: {
                name: "Weakness", //EX. Anaxagoras
                desc: "Applies elemental weakness of your main dps on your team (based on highest atk).",
                prop: {
                    health: 3000,
                    def: 1500,
                    speed: 140,
                    atk: 1800
                }
            },
            stun: {
                name: "Stun", //EX. Welt
                desc: "Slows/stuns enemies.",
                prop: {
                    health: 2800,
                    def: 1600,
                    speed: 150,
                    atk: 1400
                }
            },
            penetrate: {
                name: "Penetrate", //EX. Silver Wolf
                desc: "Lowers enemy defense and applies a debuff that causes them to take more damage.",
                prop: {
                    health: 2800,
                    def: 1600,
                    speed: 150,
                    atk: 1400
                }
            }
        }
    },
    healer: {
        name: "Healer", 
        desc: "Heals allies.",
        subclasses: {
            hot: {
                name: "HoT", //EX. Lynx
                desc: "Applies an inital heal along with healing over time effects to allies.",
                prop: {
                    health: 3800,
                    def: 1500,
                    speed: 100,
                    atk: 1000
                }
        },
            energy: {
                name: "Energy", //EX. Huo Huo
                desc: "Heals allies and restores their energy for ultimates.",
                prop: {
                    health: 4200,
                    def: 1400,
                    speed: 130,
                    atk: 1200
                }
            }
        }
    }
}

