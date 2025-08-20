import { Redis } from "ioredis"

const redis = new Redis()

redis.on("connect", () => {
    console.log("redis was connected on port 6379")
})

export async function storeValues({
    message,
    roomId,
}: {
    message: object
    roomId: number
}) {
    let messageStr = JSON.stringify(message)
    console.log(messageStr)
    await redis.publish(`roomId:${roomId}:message:`, messageStr)
    console.log("Message uploaded to redis")
}

export async function getValues({ roomId }: { roomId: number }) {
    const sub = new Redis()

    await sub.subscribe(`roomId:${roomId}:`)
    // whenever new message comes make sure to push it to connected users
    sub.on("message", (channel, message) => {
        const parsedMessage = JSON.parse(message)
        return parsedMessage
        // send all active users the message
    })
}
