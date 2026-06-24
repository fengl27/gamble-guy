
var upgradeChoices = [];
var currPossibleUpgrades = [];
var possibleUpgrades = [
    {
        name: 'Get sword!',
        symbol: [assets.weapons, 2, 0],//sword
        description: "The classic",
        effect: function() {
            playerStuff.weapons.push(weapons.sword);
        },
        amount: 1,
        criteria: () => true, //normally omit when no criteria
        branchThing: [
            {
                name: 'Bigger sword',
                symbol: [assets.weapons, 2, 0],
                description: "you can out-range the knight guy now",
                effect: function() {
                    weapons.sword.stats.size+=1;
                    
                },
                amount: 1,
                criteria: () => true, //normally omit when no criteria
                branchThing: [
                    
                    {
                        name: 'Faster sword',
                        symbol: [assets.weapons, 2, 0],
                        description: "arrows be-gone",
                        effect: function() {
                            weapons.sword.stats.dirVel+=0.05;
                        },
                        amount: 1,
                        criteria: () => true, //normally omit when no criteria
                        branchThing: [
                            {
                                name: 'tornado swipe',
                                symbol: [assets.weapons, 2, 0],
                                description: "The hands can't hit what the eyes can't see (we can still see you)",
                                effect: function() {
                                    weapons.sword.stats.size-=3;
                                    weapons.sword.stats.dirVel += 0.1;
                                },
                                amount: 1,
                                criteria: () => true, //normally omit when no criteria
                                branchThing: [
                                    
                                ]//infinity annd beeeoyingd
                            },
                            
                        ]//infinity annd beeeoyingd
                    },
                    {
                        name: 'Even bigger sword',
                        symbol: [assets.weapons, 2, 0],
                        description: "less risk, probobly",
                        effect: function() {
                            weapons.sword.stats.size+=1;
                        },
                        amount: 1,
                        criteria: () => true, //normally omit when no criteria
                        branchThing: [
                            {
                                name: 'Great sword',
                                symbol: [assets.weapons, 2, 0],
                                description: "float like a brick, sting like a brick",
                                effect: function() {
                                    weapons.sword.stats.size+=5;
                                    weapons.sword.stats.damage+=1;
                                    weapons.sword.stats.dirVel -= 0.1;
                                },
                                amount: 1,
                                criteria: () => true, //normally omit when no criteria
                                branchThing: [
                                    
                                ]//infinity annd beeeoyingd
                            },
                            
                        ]//infinity annd beeeoyingd
                    },
                ]//infinity annd beeeoyingd
            },
        ]//infinity annd beeeoyingd
    },
    {
        name: 'Get bow!',
        symbol: [assets.weapons, 1, 0],
        description: "For people who want to not die",
        effect: function() {
            playerStuff.weapons.push(weapons.bow);
        },
        amount: 1,
        criteria: () => true, //normally omit when no criteria
        branchThing: [
            {
                name: 'Arrow size',
                symbol: [assets.weapons, 1, 0],
                description: "I can't aim so I'm adding an upgrade to help me",
                effect: function() {
                    weapons.arrow.stats.size+=1;
                    
                },
                amount: 1,
                criteria: () => true, //normally omit when no criteria
                branchThing: [
                {
                    name: 'Bigger arrow',
                    symbol: [assets.weapons, 1, 0],
                    description: "I still can't aim so I'm adding another upgrade to help me",
                    effect: function() {
                        weapons.arrow.stats.size+=1;
                    },
                    amount: 1,
                    criteria: () => true, //normally omit when no criteria
                    branchThing: [
                        {
                            name: 'Spear',
                            symbol: [assets.weapons, 3, 0],
                            description: "it's so big that we might as well just shoot a spear",
                            effect: function() {
                                weapons.arrow.stats.size+=2;
                                weapons.arrow.isSpear = true;
                                weapons.bow.stats.playerSlow -= 0.1;
                                weapons.bow.stats.chargeMult -= 0.2;
                            },
                            amount: 1,
                            criteria: () => true, //normally omit when no criteria
                            branchThing: [
                                {
                                    name: 'Bigger Spear',
                                    symbol: [assets.weapons, 3, 0],
                                    description: "let's say it together! \n who can't aim? \n I can't aim!!",
                                    effect: function() {
                                        weapons.arrow.stats.size+=2;
                                        weapons.arrow.stats.damage+=1;
                                        weapons.bow.stats.playerSlow -= 0.1;
                                        weapons.bow.stats.chargeMult -= 0.1;
                                    },
                                    amount: 1,
                                    criteria: () => true, //normally omit when no criteria
                                    branchThing: [
                                        
                                    ]//infinity annd beeeoyingd
                                },
                                
                            ]//infinity annd beeeoyingd
                        },
                        
                    ]//infinity annd beeeoyingd
                },
                {
                    name: 'Faster Bow',
                    symbol: [assets.weapons, 1, 0],
                    description: "better pull",
                    effect: function() {
                        weapons.bow.stats.chargeMult += 0.2;
                        weapons.bow.stats.dirAccel += 0.02;
                    },
                    amount: 1,
                    criteria: () => true, //normally omit when no criteria
                    branchThing: [
                        {
                            name: 'Faster Bow',
                            symbol: [assets.weapons, 1, 0],
                            description: "even better pull",
                            effect: function() {
                                weapons.bow.stats.chargeMult += 0.2;
                                weapons.bow.stats.dirAccel += 0.02;
                            },
                            amount: 1,
                            criteria: () => true, //normally omit when no criteria
                            branchThing: [
                                {
                                    name: 'light bow',
                                    symbol: [assets.weapons, 1, 0],
                                    description: "newton's third law",
                                    effect: function() {
                                        weapons.bow.stats.chargeMult += 0.2;
                                        weapons.bow.stats.dirAccel += 0.08;
                                    },
                                    amount: 1,
                                    criteria: () => true, //normally omit when no criteria
                                    branchThing: [
                                        
                                    ]//infinity annd beeeoyingd
                                },
                                
                            ]//infinity annd beeeoyingd
                        },
                        
                    ]//infinity annd beeeoyingd
                },
                {
                    name: 'Mouse aiming',
                    symbol: [assets.weapons, 1, 0],
                    description: "were nerfing the charge rate",
                    effect: function() {
                        weapons.bow.stats.mouseAiming = true;
                        weapons.bow.stats.chargeMult -= 0.04
                    },
                    amount: 1,
                    criteria: () => true, //normally omit when no criteria
                    branchThing: [
                        
                    ]//infinity annd beeeoyingd
                },
                ]//infinity annd beeeoyingd
            },
        ]//infinity annd beeeoyingd
    },
    {
        name: 'Get mace!',
        symbol: [assets.weapons, 4, 0],
        description: "mobility players and midranger's dream",
        effect: function() {
            playerStuff.weapons.push(weapons.throwMace);
        },
        amount: 1,
        criteria: () => true,
        branchThing: [
            {
                name: 'Mace size',
                symbol: [assets.weapons, 4, 0],
                description: "run into enemies less (I guess easier aiming too)",
                effect: function() {
                    weapons.throwMace.stats.size+=0.5;
                },
                amount: 1,
                criteria: () => true, //normally omit when no criteria
                branchThing: [
                    {
                        name: 'Mace max charge',
                        symbol: [assets.weapons, 4, 0],
                        description: "big zoom",
                        effect: function() {
                            weapons.throwMace.stats.maxCharge+=1;
                        },
                        amount: 1,
                        criteria: () => true, //normally omit when no criteria
                        branchThing: [
                            
                            
                        ]//infinity annd beeeoyingd
                    },
                    
                ]//infinity annd beeeoyingd
            },
            {
                name: 'More mace weight',
                symbol: [assets.weapons, 4, 0],
                description: "pros: go farther, cons: go farther",
                effect: function() {
                    weapons.throwMace.stats.weightPercentage-=0.05;
                },
                amount: 1,
                criteria: () => true, //normally omit when no criteria
                branchThing: [
                    {
                        name: 'The power of thor',
                        symbol: [assets.weapons, 4, 0],
                        description: "pros: it's heavy, cons: your not worthy",
                        effect: function() {
                            weapons.throwMace.stats.weightPercentage-=0.2;
                            weapons.throwMace.stats.damage+=1;
                        },
                        amount: 1,
                        criteria: () => true, //normally omit when no criteria
                        branchThing: [
                            
                        ]//infinity annd beeeoyingd
                    },
                    
                ]//infinity annd beeeoyingd
            },
            
            {
                name: 'Less mace weight',
                symbol: [assets.weapons, 4, 0],
                description: "carbon fiber + aluminum",
                effect: function() {
                    weapons.throwMace.stats.weightPercentage+=0.05;
                },
                amount: 1,
                criteria: () => true, //normally omit when no criteria
                branchThing: [
                    {
                        name: 'Less mace weight',
                        symbol: [assets.weapons, 4, 0],
                        description: "are you sure you want to use a pillow",
                        effect: function() {
                            weapons.throwMace.stats.weightPercentage-=0.1;
                            weapons.throwMace.stats.damage-=1;
                        },
                        amount: 1,
                        criteria: () => true, //normally omit when no criteria
                        branchThing: [
                            
                        ]//infinity annd beeeoyingd
                    },
                    
                ]//infinity annd beeeoyingd
            },
            {
                name: 'Chain pulling',
                symbol: [assets.weapons, 4, 0],
                description: "you suddenly realize you can pull on the chain",
                effect: function() {
                    weapons.throwMace.stats.pullStrength+=0.02
                },
                amount: 1,
                criteria: () => true, //normally omit when no criteria
                branchThing: [
                    {
                        name: 'Better pulling',
                        symbol: [assets.weapons, 4, 0],
                        description: "you suddenly realize you can pull harder on the chain",
                        effect: function() {
                            weapons.throwMace.stats.pullStrength+=0.08
                        },
                        amount: 1,
                        criteria: () => true, //normally omit when no criteria
                        branchThing: [
                            
                        ]//infinity annd beeeoyingd
                    },
                    
                ]//infinity annd beeeoyingd
            },

        ]//infinity annd beeeoyingd
    },
    {
        name: 'Shoes',
        symbol: [assets.upgradeIcons, 0, 0],
        description: "Move 20% faster",
        effect: function() {
            playerStuff.stats.speed *= 1.2;
        },
        amount: 1,
        criteria: () => true,
        branchThing: [

        ]//infinity annd beeeoyingd
    },
    {
        name: 'Shield',
        symbol: [assets.shield, 0, 0],
        description: "it's like iFrames, but on cooldown and only once \n btw we made this after the tutorial so figure it out yourself",
        effect: function() {
            playerStuff.stats.shields += 1;
        },
        amount: 1,
        criteria: () => true,
        branchThing: [
            {
                name: 'Shield length',
                symbol: [assets.shield, 0, 0],
                description: "parry this you filthy casual",
                effect: function() {
                    playerStuff.stats.shieldLength += 30;
                    playerStuff.stats.parryLength += 5;
                },
                amount: 1,
                criteria: () => true,
                branchThing: [

                ]//infinity annd beeeoyingd
            },

        ]//infinity annd beeeoyingd
    },
    /*
    {
        name: '1 MORBILLION UBeRS GET',
        description: "morbiattle cats",
        effect: function(player) {
            for(var i = 0; i < 10; i ++) {
                inventory.push(["test", 1]);
            }
        },
        branchThing: []//infinity annd beeeoyingd
    }*/
];
var thingy = function(upgrades) {//loops through literally everything
    for(var i = 0; i < upgrades.length; i ++) {
        upgrades[i].description = upgrades[i].description.split("\n").join(" \n ");//so that when i split by spaces it separates \n as its own word
        if(upgrades[i].branchThing === "self") {
            upgrades[i].branchThing = [upgrades[i]];
        }
        else {
            thingy(upgrades[i].branchThing);
        }
    }
};
thingy(possibleUpgrades);
for(var i = 0; i < possibleUpgrades.length; i ++) {
    currPossibleUpgrades.push(possibleUpgrades[i]);
}