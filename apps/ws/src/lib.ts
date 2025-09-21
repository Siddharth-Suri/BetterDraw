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
    username,
}: {
    username: string
    message: string
    userId: number
    roomId: number
}) => {
    console.log(
        "message is = " +
            message +
            " roomid is = " +
            roomId +
            " userid is = " +
            userId
    )
    const messageCreate = await prisma.chat.create({
        data: {
            username:username,
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

// for auto deletion of values
export const updateUser = async ({ roomId }: { roomId: number }) => {
    const room = await prisma.room.update({
        where: {
            roomId,
        },
        data: {
            lastEmpty: new Date(),
        },
    })
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
