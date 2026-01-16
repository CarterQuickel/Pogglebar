const elements = [
    {
        name: "fire", 
        base_dg: 0, // base damage
        ehr: 0.3, // extra hit rate
        dot: 5, // damage over time
        slow: 0, // slow percentage
        status: "burn" // status effect
    },
    {
        name: "ice",
        base_dg: 10,
        ehr: 0.4,
        dot: 3,
        slow: 0.2,
        status: "freeze"
    },
    {
        name: "lightning",
        base_dg: 15,
        ehr: 0.5,
        dot: 0,
        slow: 0,
        status: "shock"
    },
    {
        name: "poison",
        base_dg: 5,
        ehr: 0.2,
        dot: 7,
        slow: 0,
        status: "poison"
    },
    {
        name: "water",
        base_dg: 8,
        ehr: 0.3,
        dot: 2,
        slow: 0.1,
        status: "drench"
    }, 
    {
        name: "wind",
        base_dg: 12,
        ehr: 0.4,
        dot: 0,
        slow: 0.15,
        status: "windsheer"
    },
    {
        name: "dark",
        base_dg: 20,
        ehr: 0.25,
        dot: 4,
        slow: 0,
        status: "fear"
    },
    {
        name: "physical",
        base_dg: 5,
        ehr: 0.3,
        dot: 0,
        slow: 0,
        status: "bleed"
    }
];