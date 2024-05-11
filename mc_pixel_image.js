const sharp = require("sharp");
const Jimp = require("jimp");

async function readImg() {
    await Jimp.read("./Cybord_Idle.png")
}
readImg()