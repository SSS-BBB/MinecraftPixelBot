const mineflayer = require("mineflayer")
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder")

const bot = mineflayer.createBot({
    host: "localhost",
    port: 52137,
    username: "Pixel_Bot"
})

bot.loadPlugin(pathfinder)

bot.once("spawn", () => {
    bot.mcData = require("minecraft-data")(bot.version)
})

bot.on("chat", (username, message) => {
    const player = bot.players[username]
    if (message.toLowerCase() === "place") {
        placeBlockAt(player.entity.position)
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

function placeBlockAt(p, faceVector={ x: 0, y: 1, z: 0 }, placeBlockName="stone") {
    if (placing) {
        bot.chat("I am placing other blocks.")
        return
    }

    placing = true
    let position = p.clone()
    // Move To Nearby Block
    bot.pathfinder.setMovements(new Movements(bot, bot.mcData))
    bot.pathfinder.setGoal(new goals.GoalNear(position.x, position.y, position.z, 0), false)

    setTimeout(async () => {
        // Moving
        const t1 = new Date().getTime()
        let t2 = new Date().getTime()
        while(bot.pathfinder.isMoving()) {
            t2 = new Date().getTime()
            if (t2 - t1 > 10000) {
                bot.chat("Too long...")
                break
            }

            // bot.chat(bot.entity.position.distanceTo(position).toString())

            await bot.waitForTicks(1)
        }
        bot.pathfinder.stop()
        bot.pathfinder.setGoal(null)
        
        // Place block
        if (!holdItem(placeBlockName)) return

        let sourceBlock = bot.blockAt(bot.entity.position.offset(1, 0, 0))

        try {
            await bot.placeBlock(sourceBlock, faceVector)
        }
        catch (err) {
            if (!err.message.includes("Event") || !err.message.includes("did not fire within timeout")) {
                console.log(err)
            }
        }

        placing = false
    }, 150)
}