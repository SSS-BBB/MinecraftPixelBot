const mineflayer = require("mineflayer")
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder")

const bot = mineflayer.createBot({
    host: "localhost",
    port: 52137,
    username: "Pixel_Bot"
})

const testBot = mineflayer.createBot({
    host: "localhost",
    port: 52137,
    username: "Test_Bot"
})

bot.loadPlugin(pathfinder)
testBot.loadPlugin(pathfinder)

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
        createGrid(3, 3, player.entity.position)
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
    placing = false
    return false
}

async function placeBlockAt(p, backward=false, faceVector={ x: 0, y: 1, z: 0 }, placeBlockName="stone") {
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
    if (!holdItem(placeBlockName)) return

    let sourceBlock
    if (!backward) {
        sourceBlock = bot.blockAt(bot.entity.position.offset(1, 0, 0))
    }
        
    else {
        sourceBlock = bot.blockAt(bot.entity.position.offset(-1, -1, 0))
    }

    placing = false

    try {
        await bot.placeBlock(sourceBlock, faceVector)
    }
    catch (err) {
        if (!err.message.includes("Event") || !err.message.includes("did not fire within timeout")) {
            console.log(err)
        }
    }
}

async function createGrid(row_num, col_num, sPos) {
    const startPos = sPos.clone()
    for (let r = 0; r < row_num; r++) {
        let currentPos
        for (let c = 0; c < col_num; c++) {
            currentPos = startPos.offset(-c-1, r, 0)
            await placeBlockAt(currentPos)
        }
        currentPos = startPos.offset(-col_num+1, r+1, 0)
        await placeBlockAt(currentPos, true)
    }
}