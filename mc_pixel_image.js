const sharp = require("sharp");
const Jimp = require("jimp");

async function readImg() {
    const image = await Jimp.read("shapes.png")

    image.resize(32, 32)

    image.write("edited-shapes.png")
    
    const pixelData = await scanImg(image)
    console.log(pixelData)
    
}

async function scanImg(image) {
    let pixelData = []

    await image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
        let red = this.bitmap.data[idx + 0]
        let green = this.bitmap.data[idx + 1];
        let blue = this.bitmap.data[idx + 2];
        let alpha = this.bitmap.data[idx + 3];

        pixelData.push({
            r: red,
            g: green,
            b: blue
        })
    })

    return pixelData
}

readImg()