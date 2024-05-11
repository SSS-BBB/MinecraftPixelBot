const mineflayer = require("mineflayer")
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder")
const { getMCBlockFromImg } = require("./mc_pixel_image")

const bot = mineflayer.createBot({
    host: "localhost",
    port: 58952,
    username: "Pixel_Bot"
})

bot.loadPlugin(pathfinder)

bot.once("spawn", () => {
    bot.mcData = require("minecraft-data")(bot.version)
})

bot.on("chat", async (username, message) => {
    const player = bot.players[username]
    if (message.toLowerCase() === "place") {
        placeBlockAt(player.entity.position, true)
        // let sourceBlock = bot.blockAt(bot.entity.position.offset(1, 0, 0))
        // await testBot.placeBlock(sourceBlock, { x: 0, y: 1, z: 0 })
        // testBot.chat("Place finished.")

        // testBot.pathfinder.setMovements(new Movements(testBot, require("minecraft-data")(bot.version)))

        // try {
        //     await testBot.pathfinder.goto(new goals.GoalNear(player.entity.position.x, player.entity.position.y,
        //                                                 player.entity.position.z, 0
        //     ))
        //     testBot.chat("Here!")
        //     let sourceBlock = bot.blockAt(testBot.entity.position.offset(1, 0, 0))
        //     await testBot.placeBlock(sourceBlock, { x: 0, y: 1, z: 0 })
        //     testBot.chat("Placed!")
        // } catch(e) {
        //     // console.error(e)
        // }
        
    }

    if (message.toLowerCase() === "create grid") {
        createGrid(16, 16, player.entity.position)
    }

    if (message.toLowerCase() === "create image") {
        createImage(player.entity.position)
    }
})

let placing = false

function holdItem(itemName) {
    const item = bot.inventory.items().find(item => item.name.toLowerCase().includes(itemName))
    if (item) {
        bot.equip(item, "hand")
        return true
    }

    bot.chat(`No ${itemName} in my inventory.`)
    placing = true
    return false
}

function getRandomBlock() {
    const blocks = bot.inventory.items()

    if (blocks.length > 0) {
        const length = blocks.length
        const randIndex = Math.floor(Math.random() * length)
        return blocks[randIndex].name
    }
    return false
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function tryPlaceBlock(sourceBlock, faceVector) {
    try {
        await bot.placeBlock(sourceBlock, faceVector)
    }
    catch (err) {
        if (!err.message.includes("Event") || !err.message.includes("did not fire within timeout")) {
            console.log(err)
        }
    }
}

async function placeBlockAt(p, backward=false, placeBlockName="stone", faceVector={ x: 0, y: 1, z: 0 }) {
    if (placing) {
        bot.chat("I am placing other blocks.")
        return
    }

    placing = true
    let position = p.clone()
    // Move To Nearby Block
    bot.pathfinder.setMovements(new Movements(bot, bot.mcData))
    await bot.pathfinder.goto(new goals.GoalNear(position.x, position.y, position.z, 0), false)
    bot.pathfinder.stop()
    bot.pathfinder.setGoal(null)
        
    // Place block
    while (!holdItem(placeBlockName)) {
        await bot.waitForTicks(1)
    }

    let sourceBlock
    if (!backward) {
        sourceBlock = bot.blockAt(bot.entity.position.offset(1, 0, 0))
    }
        
    else {
        sourceBlock = bot.blockAt(bot.entity.position.offset(-1, -1, 0))
    }

    await timeout(150)
    placing = false

    tryPlaceBlock(sourceBlock, faceVector)
}

async function createGrid(row_num, col_num, sPos) {
    const startPos = sPos.clone()
    for (let r = 0; r < row_num; r++) {
        let currentPos
        for (let c = 0; c < col_num; c++) {
            currentPos = startPos.offset(-c-1, r, 0)
            const randBlock = getRandomBlock()
            if (randBlock) {
                await placeBlockAt(currentPos, false, randBlock)
            }
            else {
                await placeBlockAt(currentPos, false, "glass")
            }
            
        }
        currentPos = startPos.offset(-col_num+1, r+1, 0)
        await placeBlockAt(currentPos, true, "glass")
    }
}

async function createImage(sPos) {
    const row_num = 16
    const col_num = 16

    const pixelData = await getMCBlockFromImg("black_hole.png", row_num, col_num, bot.version)

    const startPos = sPos.clone()
    for (let r = 0; r < row_num; r++) {
        let currentPos
        for (let c = 0; c < col_num; c++) {
            currentPos = startPos.offset(-c-1, r, 0)
            const blockToPlace = pixelData[r][c]
            if (blockToPlace) {
                await placeBlockAt(currentPos, false, blockToPlace)
            }
            else {
                await placeBlockAt(currentPos, false, "glass")
            }
            
        }
        currentPos = startPos.offset(-col_num+1, r+1, 0)
        await placeBlockAt(currentPos, true, "glass")
    }
    // console.log(pixelData)
}