const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

ctx.imageSmoothingEnabled = false;

const h100 = canvas.height / 100;
const w100 = canvas.width / 100;
const ar = canvas.width / canvas.height;//16/9
const settings = {
    get musicVolMult() {
        var vol = pauseSettingsEl.querySelector("#musicVolSlider").value / 100;
        return isNaN(vol)? 1: vol;
    },
    get sfxVolMult() {
        var vol = pauseSettingsEl.querySelector("#sfxVolSlider").value / 100;
        return 0.3*(isNaN(vol)? 1: vol);
    },
    //emeny
    deathDelay: 30,
    //archer
    archerWindupTime: 40,
    archerReloadTime: 100,
    //crossbow
    crossbowWindupTime: 60,
    crossbowReloadTime: 100,

    levelSize: new Vect(100*ar, 100),
    //misc
    screenshakeMult: h100,
};
const l2 = Vect.div(settings.levelSize, 2);

//LA GAME STATE FOR STAT MACHINEINE
var gameState = "mainMenu";
var paused = false;
var tutorial = true;//aee

const pauseSettingsEl = document.getElementById("pauseSettings");

const pauseSettingSoundTest = new Audio("assets/sounds/sound-test.mp3");
pauseSettingsEl.querySelector("#musicVolSlider").addEventListener("change", (e) => {
    pauseSettingSoundTest.volume = settings.musicVolMult;
    pauseSettingSoundTest.currentTime = 0;
    pauseSettingSoundTest.play();
});
pauseSettingsEl.querySelector("#sfxVolSlider").addEventListener("change", (e) => {
    soundEffects.kill.play();
});

//assets lol
var assets = {
    player: "player.png",
    archer: "archer.png",
    archerShoot: "archer-shoot.png",
    archerShootMoving: "archer-shoot-moving.png",
    crossbow: "crossbow.png",
    crossbowShoot: "crossbow-shoot.png",
    //grass: "grass.png",
    bricks: "bricks.png",//floor
    wood: "wood.png",//tutorifloor

    arrow: "arrow.png",
    rock: "rock.png",
    rockDamaged: "rock-damaged.png",
    small: "small.png",
    smallDashing: "small-dashing.png",
    controller: "controller.png",
    rogue: "rogue.png",
    stack: "two-mini.png",
    barbarian: "barbarian.png",
    golemite: "golumite.png",


    sword: "sword.png",
    spear: "spear.png",
    fencer: "fencer.png",
    swordless: "swordless.png",
    weapons: "weapons.png",
    
    death: "death.png",

    plus: "plus.png"
};
for(var i in assets) {
    let bob = new Image();
    bob.src = "assets/"+assets[i];
    assets[i] = bob;
}

const fonts = [
    {path: "assets/bytebounce-font/ByteBounce.ttf", name: "pixelFont"},
    {path: "assets/lowerpixel-font/LowresPixel-Regular.otf", name: "pixelFontSmall"}
]

async function loadFont() {
    //font time
    try {
        // 1. Define the font face (Font Family Name, URL source)
        for(var i = 0; i < fonts.length; i ++) {
            let myFont = new FontFace(
                fonts[i].name,
                'url("' + fonts[i].path + '")'
            );

            let loadedFont = await myFont.load();
            document.fonts.add(loadedFont);
        }
        console.log("yay font worked");
    }
    catch(error) {
        console.error("uhhhh the fon't:" + error);
    }
};
loadFont();
