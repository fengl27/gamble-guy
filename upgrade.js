
var upgradeChoices = [];
var currPossibleUpgrades = [];
var possibleUpgrades = [
    {
        name: 'something',
        description: "stuff",
        effect: function() {
            for(var i = 0; i < 3; i ++) {
                inventory.push(["normal", 1]);
            }
        },
        amount: 1,
        cost: 2,
        criteria: () => true, //normally omit when no criteria
        branchThing: "self"//infinity annd beeeoyingd
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