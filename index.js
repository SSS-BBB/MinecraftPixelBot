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

function placeBlockAt(position, faceVector = { x: 0, y: 1, z: 0 }) {
    // Move To Nearby Block
    bot.pathfinder.setMovements(new Movements(bot, bot.mcData))
    bot.pathfinder.setGoal(new goals.GoalBlock(position.x, position.y, position.z))

    setTimeout(async () => {
        const t1 = new Date().getTime()
        let t2 = new Date().getTime()
        while(bot.pathfinder.isMoving()) {
            t2 = new Date().getTime()
            if (t2 - t1 > 5000) break

            await bot.waitForTicks(1)
        }
    
        // Place block
        let sourceBlock = bot.blockAt(bot.entity.position.offset(0, 0, 1.5))
        let checkBlock = bot.blockAt(sourceBlock.position.offset(faceVector.x, faceVector.y, faceVector.z))
        if (checkBlock.name !== "air") {
            bot.chat("Cannot place here.")
            return
        }

        try {
            await bot.placeBlock(sourceBlock, faceVector)
        }
        catch (err) {
            if (!err.message.includes("Event") || !err.message.includes("did not fire within timeout")) {
                console.log(err)
            }
        }
    }, 150)
}