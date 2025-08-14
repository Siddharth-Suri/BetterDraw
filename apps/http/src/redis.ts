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
    const messageStr = JSON.stringify(message)

    await redis.lpush(`roomId:${roomId}:message:`, messageStr)
    console.log("Pushed to redis list ")
}

export async function getAllRoomMessages({ roomId }: { roomId: number }) {
    // get last 50 messages , here -50 is fifty from the end and till the last
    const values = await redis.lrange(`roomId:${roomId}`, -50, -1)
    return values
    console.log("Gotten last 50 messages from redis list ")
}
