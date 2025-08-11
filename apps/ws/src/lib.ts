import { prisma } from "@repo/db/client"
import { JwtPayload } from "jsonwebtoken"
import { WebSocket } from "ws"

export type UserConnection = {
    userId: number
    ws: WebSocket
}

export async function CascadeValue({
    verifiedToken,
}: {
    verifiedToken: JwtPayload
}) {
    const { roomId, roomNameSlug } = verifiedToken
    const roomName = await prisma.room.findFirst({
        where: {
            OR: [{ roomId }, { roomNameSlug }],
        },
        include: {
            users: true,
        },
    })
    const countOfUsers = roomName?.users.length ?? 0
    if (countOfUsers === 0) {
        const cascadeValue = await prisma.room.delete({
            where: {
                roomId,
            },
        })
    }
}
