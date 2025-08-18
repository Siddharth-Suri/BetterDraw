import { prisma } from "@repo/db/client"
import { WebSocket } from "ws"

export type UserConnection = {
    userId: number
    ws: WebSocket
}

// checks user count whenever each collaborator leaves & deletes room if empty

export async function CascadeValue({ roomId }: { roomId: number }) {
    let room
    try {
        room = await prisma.room.findFirst({
            where: {
                roomId,
            },
            include: {
                users: true,
            },
        })
    } catch (e) {
        throw e
    }

    const countOfUsers = room?.users.length ?? 0
    if (countOfUsers === 0) {
        const cascadeValue = await prisma.room.delete({
            where: {
                roomId,
            },
        })
    }
}
export const messageCreateFunction = async ({
    message,
    userId,
    roomId,
}: {
    message: string
    userId: number
    roomId: number
}) => {
    const messageCreate = await prisma.chat.create({
        data: {
            message: message,
            userId: userId,
            roomId: roomId,
        },
    })
}
