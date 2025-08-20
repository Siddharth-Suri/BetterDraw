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

// create message buffer for uploading to db

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
    console.log(
        "Db created message room:" +
            messageCreate.roomId +
            " Chat : " +
            messageCreate.message
    )
}

// get past messages

export const getPastMessages = async ({ roomId }: { roomId: number }) => {
    const messages = await prisma.room.findUnique({
        where: { roomId },
        include: {
            chat: {
                orderBy: {
                    chatId: "asc",
                },
            },
        },
    })
    const pastMessageArray = messages?.chat
    return pastMessageArray
}
