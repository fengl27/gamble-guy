
var upgradeChoices = [];
var currPossibleUpgrades = [];
var possibleUpgrades = [
    {
        name: 'Get sword!',
        symbol: [assets.weapons, 2, 0],//sword
        description: "The classic (medium)",
        effect: function() {
            playerStuff.weapons.push(weapons.sword);
        },
        amount: 1,
        criteria: () => true, //normally omit when no criteria
        branchThing: [
            {
                name: 'Bigger sword',
                symbol: [assets.weapons, 2, 0],
                description: "you can outrange the knight guy now",
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
                                name: 'Plasma blade',
                                symbol: [assets.weapons, 5, 0],
                                description: "LOOK, IT'S THE doom GUY FROM halo \n \n speedy small speed speed walk fast sword go brrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr",
                                effect: function() {
                                    weapons.sword.stats.isLaser = true;
                                    weapons.sword.stats.dirVel += 0.25;
                                    weapons.sword.stats.size-=2;
                                    playerStuff.stats.speed *= 1.2;
                                },
                                amount: 1,
                                criteria: () => true, //normally omit when no criteria
                                branchThing: [
                                    
                                ]//infinity annd beeeoyingd

                            }
                            
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
                                symbol: [assets.weapons, 6, 0],
                                description: "float like a brick, sting like a brick \n \n wow, this great sword sure is great (and inconveniently large)\n(+1 damage, -speed, +5 size, +cool looking sword)",
                                effect: function() {
                                    weapons.sword.stats.isGreatSword = true;
                                    weapons.sword.stats.size+=3;
                                    weapons.sword.stats.damage+=1;
                                    weapons.sword.stats.dirVel -= 0.13;
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
        description: "For people who want to not die (medium)",
        effect: function() {
            playerStuff.weapons.push(weapons.bow);
        },
        amount: 1,
        criteria: () => true, //normally omit when no criteria
        branchThing: [
            {
                name: 'Arrow size',
                symbol: [assets.weapons, 1, 0],
                description: "I can't aim so I'm adding an upgrade to help me (+20% size)",
                effect: function() {
                    weapons.arrow.stats.size+=1;
                    
                },
                amount: 1,
                criteria: () => true, //normally omit when no criteria
                branchThing: [
                {
                    name: 'Bigger arrow',
                    symbol: [assets.weapons, 1, 0],
                    description: "I still can't aim so I'm adding another upgrade to help me (+16.666666666666666666667% size)",
                    effect: function() {
                        weapons.arrow.stats.size+=1;
                    },
                    amount: 1,
                    criteria: () => true, //normally omit when no criteria
                    branchThing: [
                        {
                            name: 'Spear',
                            symbol: [assets.weapons, 3, 0],
                            description: "The arrow's so big that we might as well just shoot a spear (+28.57142857142857142857142857142857142857142857142857142857% size, +spear, -slowness while charging, -slower charge) \n \n ultimate math nerds will realize the size increase is x9/7",
                            effect: function() {
                                weapons.arrow.stats.size+=2;
                                weapons.arrow.stats.isSpear = true;
                                weapons.bow.stats.playerSlow -= 0.1;
                                weapons.bow.stats.chargeMult -= 0.2;
                            },
                            amount: 1,
                            criteria: () => true, //normally omit when no criteria
                            branchThing: [
                                {
                                    name: 'Bigger Spear',
                                    symbol: [assets.weapons, 3, 0],
                                    description: "let's say it together! \n who can't aim? \n I can't aim!! (+25% size, +1 damage, -slowness while charging, -slower charge)",
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
                
                ]//infinity annd beeeoyingd
            },
            {
                name: 'Faster Bow',
                symbol: [assets.weapons, 1, 0],
                description: "Better pull (20% faster charge + faster spin speed)",
                effect: function() {
                    weapons.bow.stats.chargeMult += 0.2;
                    weapons.bow.stats.dirAccel += 0.02;
                },
                amount: 1,
                criteria: () => true, //normally omit when no criteria
                branchThing: [
                    {
                        name: 'Even Faster Bow TM',
                        symbol: [assets.weapons, 1, 0],
                        description: "Even better pull (17% faster charge + even faster spin speed)",
                        effect: function() {
                            weapons.bow.stats.chargeMult += 0.2;
                            weapons.bow.stats.dirAccel += 0.02;
                        },
                        amount: 1,
                        criteria: () => true, //normally omit when no criteria
                        branchThing: [
                            {
                                name: 'Lightest bow',
                                symbol: [assets.weapons, 1, 0],
                                description: "Newton's third law make bow go NYYYYYYYYYYYYYYYYYYYRROOOOOOOOM",
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
                description: "We're nerfing the charge rate, though (by 30%) (this upgrade was way too good)",
                effect: function() {
                    weapons.bow.stats.mouseAiming = true;
                    weapons.bow.stats.chargeMult -= 0.30;
                },
                amount: 1,
                criteria: () => true, //normally omit when no criteria
                branchThing: [
                    {
                        name: 'Faster Arrow',
                        symbol: [assets.weapons, 1, 0],
                        description: "I Feel the Need, the Need for Speed",
                        effect: function() {
                            weapons.bow.stats.chargeMax += 10;
                        },
                        amount: 1,
                        criteria: () => true, //normally omit when no criteria
                        branchThing: [
                            {
                                name: 'Sniper',
                                symbol: [assets.weapons, 1, 0],
                                description: "Aim small, miss small (increased damage on max charge)",
                                effect: function() {
                                    weapons.bow.stats.maxChargeDmg += 1;
                                    weapons.bow.stats.chargeMax += 20;
                                    weapons.bow.stats.zoomAmount -= 0.5;
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
        name: 'Get mace!',
        symbol: [assets.weapons, 4, 0],
        description: "mobility players and midranger's dream (hard)",
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
                        symbol: [assets.weapons, 8, 0],
                        description: "pros: it's heavy, cons: your not worthy",
                        effect: function() {
                            weapons.throwMace.stats.weightPercentage-=0.2;
                            weapons.throwMace.stats.damage+=1;
                            weapons.throwMace.stats.isHammer = true;
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
                description: "Carbon fiber + aluminum! You'll be able to charge the mace faster but won't go as far.",
                effect: function() {
                    weapons.throwMace.stats.weightPercentage-=0.05;
                    weapons.throwMace.stats.chargeSpeed *= 1.5;
                },
                amount: 1,
                criteria: () => true, //normally omit when no criteria
                branchThing: [
                    {
                        name: 'Less mace weight',
                        symbol: [assets.weapons, 9, 0],
                        description: "Are you sure you want to use a pillow?",
                        effect: function() {
                            weapons.throwMace.stats.weightPercentage-=0.1;
                            weapons.throwMace.stats.damage-=1;
                            weapons.throwMace.stats.chargeSpeed *= 1.2;
                            weapons.throwMace.stats.isPillow = true;
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
            {
                name: 'Dash shoes',
                symbol: [assets.upgradeIcons, 0, 0],
                description: "Your shoes are so good you turn into a white orb of light (even though they look the same as before).",
                effect: function() {
                    playerStuff.stats.canDash = true;
                },
                amount: 1,
                criteria: () => true,
                branchThing: [
                    
                ]//infinity annd beeeoyingd
            },
            {
                name: 'Better shoes',
                symbol: [assets.upgradeIcons, 0, 0],
                description: "Move 10% faster",
                effect: function() {
                    playerStuff.stats.speed *= 1.1;
                },
                amount: 1,
                criteria: () => true,
                branchThing: [
                ]//infinity annd beeeoyingd
            },
            {
                name: 'Well ventilated shorts',
                symbol: [assets.upgradeIcons, 1, 0],
                description: "these shorts are wonderfully comfortable and reduce chafing (move faster while charging weapons)",
                effect: function() {
                    weapons.bow.stats.playerSlow += 0.1;
                    weapons.throwMace.stats.playerSlow += 0.1;
                },
                amount: 1,
                criteria: () => true,
                branchThing: [
                    
                ]//infinity annd beeeoyingd
            }
        ]//infinity annd beeeoyingd
    },
    {
        name: 'Shield',
        symbol: [assets.shield, 0, 0],
        description: "Press space to activate the shield. If you shield right before you get hit, the enemy will take damage and you keep your shield. However, if you shield and then get hit later, you lose the shield for the round. \n (Does anyone actually read this?)",
        effect: function() {
            playerStuff.stats.shields += 1;
        },
        amount: 1,
        criteria: () => true,
        branchThing: [
            {
                name: 'Shield length',
                symbol: [assets.shield, 0, 0],
                description: "parry this ye filthy casual",
                effect: function() {
                    playerStuff.stats.shieldLength += 15;
                },
                amount: 1,
                criteria: () => true,
                branchThing: [
                    {
                        name: 'Rise of the slop hero',
                        symbol: [assets.shield, 0, 0],
                        description: "I'm going to be honest and admit that I had gemni summerize the plot of this anime",
                        effect: function() {
                            playerStuff.stats.shieldIframes += 10;
                        },
                        amount: 1,
                        criteria: () => true,
                        branchThing: [

                        ]//infinity annd beeeoyingd
                    },
                    {
                        name: 'Parry assist',
                        symbol: [assets.shield, 0, 0],
                        description: "your actually going to have to try to be able to get rid of the shield now",
                        effect: function() {
                            playerStuff.stats.shieldLength -= 20;
                            playerStuff.stats.parryLength += 10;
                            playerStuff.stats.parryDamageRadius += 1; 
                        },
                        amount: 1,
                        criteria: () => true,
                        branchThing: [

                        ]//infinity annd beeeoyingd
                    },
                ]//infinity annd beeeoyingd
            },
            {
                name: 'Second shield',
                symbol: [assets.shield, 0, 0],
                description: "I have no shield but I must block",
                effect: function() {
                    playerStuff.stats.shields += 1;
                },
                amount: 1,
                criteria: () => true,
                branchThing: [
                    {
                        name: 'Five shield',
                        symbol: [assets.shield, 0, 0],
                        description: "I'm revoking your parry privilages",
                        effect: function() {
                            playerStuff.stats.shields += 3;
                            playerStuff.stats.parryLength -= 60;
                        },
                        amount: 1,
                        criteria: () => true,
                        branchThing: [

                        ]//infinity annd beeeoyingd
                    },

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