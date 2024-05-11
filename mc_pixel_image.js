const sharp = require("sharp")
const Jimp = require("jimp")
const fs = require("fs")

async function readImg(imagePath, row_size, col_size) {
    const image = await Jimp.read(imagePath)

    image.resize(col_size, row_size)

    image.write("edited-shapes.png")
    
    const pixelData = await scanImg(image)
    return pixelData
    
}

async function scanImg(image) {
    let pixelDataArray = []
    let pixelDataRow = []

    await image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
        let red = this.bitmap.data[idx + 0]
        let green = this.bitmap.data[idx + 1];
        let blue = this.bitmap.data[idx + 2];
        let alpha = this.bitmap.data[idx + 3];

        
        pixelDataRow.push({
            r: red,
            g: green,
            b: blue
        })

        if (x === image.bitmap.width - 1) {
            pixelDataArray.push(pixelDataRow)
            pixelDataRow = []
        }

        // console.log(x)
        // console.log(y)
        // console.log(red)
        // console.log(green)
        // console.log(blue)
        // console.log("---------------")
    })

    return pixelDataArray.reverse()
}

function compareWoolImage(woolCell, imgCell) {
    let r_compare = Math.pow(woolCell.r - imgCell.r, 2)
    let g_compare = Math.pow(woolCell.g - imgCell.g, 2)
    let b_compare = Math.pow(woolCell.b - imgCell.b, 2)

    return Math.sqrt(r_compare + g_compare + b_compare)
}

exports.getMCBlockFromImg =  async function (imagePath, row_size, col_size, mcVersion) {
    const pixelData = await readImg(imagePath, row_size, col_size)
    // const woolData = fetch("mc_wool_color_info.json")
    //                 .then(response => response.json())
    //                 .then(value => console.log(value))

    let woolData = JSON.parse(fs.readFileSync("./mc_wool_color_info.json", "utf-8"))
    
    let pixelWoolArray = []

    for (let r = 0; r < pixelData.length; r++) {
        let pixelWoolRow = []
        for (let c = 0; c < pixelData[r].length; c++) {
            // Compare each pixel
            let min_compare
            let min_wool
            woolData.forEach(wool => {
                let compare = compareWoolImage(wool, pixelData[r][c])
                if (min_compare) {
                    if (compare < min_compare) {
                        min_compare = compare
                        min_wool = wool.name
                    }
                }
                else {
                    min_compare = compare
                    min_wool = wool.name
                }
            })
            pixelWoolRow.push(min_wool + "_wool")
        }
        pixelWoolArray.push(pixelWoolRow)
    }

    // console.log(pixelWoolArray[0])

    return pixelWoolArray
}

async function test() {
    const pixelData = await readImg("shapes.png", 32, 32)
    console.log(pixelData[0])
}

// test()