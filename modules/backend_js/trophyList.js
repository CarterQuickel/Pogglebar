//achievements list
const achievements = [
    [
        {
            name: "Full Combo!",
            description: "Get a 3-item combo.",
            icon: "static/icons/achievement/Full_Combo.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Coneisseur",
            description: "Have a 6-item combo.",
            icon: "static/icons/achievement/Coneisseur.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Candid Coiner",
            description: "Have a 60-item combo.",
            icon: "static/icons/achievement/Candid_Coiner.png",
            status: false,
            hidden: true,
            notified: false
        },
        {
            name: "Programming Prodigy",
            description: "Have 1100100 CP pogs.",
            icon: "static/icons/achievement/Programming_Prodigy.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "6-7",
            description: "Have 6, then 7, items in your inventory.",
            icon: "static/icons/achievement/67.png",
            status: false,
            hidden: true,
            notified: false
        },
        {
            name: "Pristine",
            description: "Have a copper, silver, and gold pog all at once.",
            icon: "static/icons/achievement/Pristine.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Exquisite",
            description: "Have a copper, silver, gold, and diamond pog all at once.",
            icon: "static/icons/achievement/Exquisite.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Mythical",
            description: "Have a copper, silver, gold, diamond, and astral pog all at once.",
            icon: "static/icons/achievement/Mythical.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Mr. Smith",
            description: "Have one of each tier pog at once.",
            icon: "static/icons/achievement/Mr_Smith.png",
            status: false,
            hidden: true,
            notified: false
        },
        {
            name: "Hoarder",
            description: "Fill your inventory to max when your inventory is greater than 60.",
            icon: "static/icons/achievement/Hoarder.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Insane Hoarder",
            description: "Own 100 pogs.",
            icon: "static/icons/achievement/Insane_Hoarder.png",
            status: false,
            hidden: true,
            notified: false
        },
    ],
    //start of level achievements
    [
        {
            name: "Rookie",
            description: "Reach level 5.",
            icon: "static/icons/achievement/Rookie.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Getting Better",
            description: "Reach level 10.",
            icon: "static/icons/achievement/Getting_Better.png",
            reward: "Combo Multiplier II",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Experienced",
            description: "Reach level 15.",
            icon: "static/icons/achievement/Experienced.png",
            reward: "Combo Multiplier III",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Veteran",
            description: "Reach level 25.",
            icon: "static/icons/achievement/Veteran.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Professional",
            description: "Reach level 40.",
            icon: "static/icons/achievement/Professional.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Halfway There",
            description: "Reach level 50.",
            icon: "static/icons/achievement/Halfway_There.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Itsumi!",
            description: "Reach level 64.",
            icon: "static/icons/achievement/Itsumi!.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Prestigious",
            description: "Reach level 75.",
            icon: "static/icons/achievement/Prestigious.png",
            status: false,
            hidden: false,
            notified: false,
        },
        {
            name: "No-Life",
            description: "Reach level 100.",
            icon: "static/icons/achievement/No-Life.png",
            status: false,
            hidden: true,
            notified: false
        },
        {
            name: "What color is grass?",
            description: "Reach the max level.",
            icon: "static/icons/achievement/What_color_is_grass.png",
            status: false,
            hidden: true,
            notified: false
        }
    ],
    //start of progression achievements
    [
        {
            name: "First Steps",
            description: "Open your first crate.",
            icon: "static/icons/achievement/First_Steps.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Pogger",
            description: "Open 100 crates.",
            icon: "static/icons/achievement/Pogger.png",
            reward: "None",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Merge Maniac",
            description: "Merge your first pog.",
            icon: "static/icons/achievement/Merge_Maniac.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Merge Monster",
            description: "Merge 30 pogs.",
            icon: "static/icons/achievement/Merge_Monster.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Merge Master",
            description: "Merge 80 pogs.",
            icon: "static/icons/achievement/Merge_Master.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "God",
            description: "Merge into a God pog.",
            icon: "static/icons/achievement/God.png",
            status: false,
            hidden: true,
            notified: false
        },
        {
            name: "Completionist",
            description: "Unlock all main achievements.",
            icon: "static/icons/achievement/Completionist.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Secret Achiever",
            description: "Unlock all secret achievements.",
            icon: "static/icons/achievement/Secret_Achiever.png",
            status: false,
            hidden: true,
            notified: false
        },
        {
            name: "Platinum Trophy",
            description: "Unlock all achievements.",
            icon: "static/icons/achievement/Platinum_Trophy.png",
            status: false,
            hidden: false,
            notified: false
        }
    ],
    //start of economy achievements
    [
        {
            name: "69",
            description: "Have exactly 69 pogs at once.",
            icon: "static/icons/achievement/69.png",
            status: false,
            hidden: true,
            notified: false
        },
        {
            name: "420",
            description: "Sell enough pogs to gain back a TOTAL of 420 digipogs.",
            icon: "static/icons/achievement/420.png",
            status: false,
            hidden: true,
            notified: false
        },
        {
            name: "Wealthy",
            description: "Make your first 1000 dollars.",
            icon: "static/icons/achievement/Wealthy.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Rich",
            description: "Have 1 million dollars at once.",
            icon: "static/icons/achievement/Rich.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Elon",
            description: "Have 100 million dollars at once.",
            icon: "static/icons/achievement/Elon.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Entrepreneur",
            description: "Make 2000 cash a second.",
            icon: "static/icons/achievement/Entrepreneur.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Tycoon",
            description: "Make 10000 cash a second.",
            icon: "static/icons/achievement/Tycoon.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Pawn Broker",
            description: "Make 50000 cash a second.",
            icon: "static/icons/achievement/Pawn_Broker.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Bank Breaker",
            description: "Make 100000 cash a second.",
            icon: "static/icons/achievement/Bank_Breaker.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Industrialist",
            description: "Own a Robux pog.",
            icon: "static/icons/achievement/Industrialist.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Capitalist",
            description: "Own a V-Bucks pog.",
            icon: "static/icons/achievement/Capitalist.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Monopoly",
            description: "Be on the Top 5 leaderboard.",
            icon: "static/icons/achievement/Monopoly.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Monarch",
            description: "Be the Top 1 on the leaderboard.",
            icon: "static/icons/achievement/Monarch.png",
            status: false,
            hidden: false,
            notified: false
        }
    ],
    //start of unique achievements
    [
        {
            name: "Nerdy Inspector",
            description: "Go to the patch notes page.",
            icon: "static/icons/achievement/Nerdy_Inspector.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Chicken Jockey!",
            description: "Get a chicken jockey.",
            icon: "static/icons/achievement/Chicken_Jockey!.png",
            status: false,
            hidden: true,
            notified: false
        },
        {
            name: "An Ender Pearl",
            description: "Get an endermen combo.",
            icon: "static/icons/achievement/An_Ender_Pearl.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Soda Pop",
            description: "Get a soda pog combo.",
            icon: "static/icons/achievement/Soda_Pop.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "SODA!",
            description: "Get one of each color soda pog.",
            icon: "static/icons/achievement/SODA!.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Sus",
            description: "Have 10 dingus pogs at once.",
            icon: "static/icons/achievement/Sus.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Elden Lord",
            description: "Get an Elden Ring pog combo.",
            icon: "static/icons/achievement/Elden_Lord.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "1% of My Power",
            description: "Get a Super Saiyan Shaggy pog combo.",
            icon: "static/icons/achievement/1_of_My_Power.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Ultimate Despair",
            description: "Get 13 DR (danganronpa) pogs",
            icon: "static/icons/achievement/Ultimate_Despair.png",
            status: false,
            hidden: true,
            notified: false
        },
        {
            name: "Shaw!",
            description: "Get a Hornet pog.",
            icon: "static/icons/achievement/Shaw!.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Uhhh",
            description: "Get an I Heart CP pog combo.",
            icon: "static/icons/achievement/Uhhh.png",
            status: false,
            hidden: true,
            notified: false
        },
        {
            name: "Reflection",
            description: "Get a Fallout Vault pog combo.",
            icon: "static/icons/achievement/Reflection.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Pineapple Under the Sea",
            description: "Get a SpongeBob pog combo.",
            icon: "static/icons/achievement/Under_the_Sea.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Mog Pog",
            description: "Get a Handsome Squidward pog combo.",
            icon: "static/icons/achievement/Mog_Pog.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Goon",
            description: "Get an anime girl pog combo.",
            icon: "static/icons/achievement/Goon.png",
            status: false,
            hidden: true,
            notified: false
        },
        {
            name: "Margot Robbie",
            description: "Get a Barbie pog combo.",
            icon: "static/icons/achievement/Margot_Robbie.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "I am Vengeance",
            description: "Get 4 Batman Robin pog combos.",
            icon: "static/icons/achievement/I_Am_Vengeance.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Nuke Kaboom",
            description: "Collect a Thomas Nuke pog.",
            icon: "static/icons/achievement/Nuke_Kaboom.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Hiding in your WiFi",
            description: "Get a Hatsune Miku pog combo.",
            icon: "static/icons/achievement/Hiding_in_your_WiFi.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "Strange Man's Game",
            description: "Get a Elf Biker pog combo.",
            icon: "static/icons/achievement/Strange_Man_s_Game.png",
            status: false,
            hidden: true,
            notified: false
        },
        {
            name: "buttr",
            description: "Get a Butter Pog combo.",
            icon: "static/icons/achievement/buttr.png",
            status: false,
            hidden: false,
            notified: false
        },
        {
            name: "OAUTH",
            description: "Get a Formbar pog combo.",
            icon: "static/icons/achievement/OAUTH.png",
            status: false,
            hidden: false,
            notified: false
        }
    ]
];

module.exports = achievements;