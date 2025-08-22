import cron from "node-cron"
import { prisma } from "@repo/db/client"

// will delete room if time>1day but only if server is active , if node js server crashes the timer is destroyed

export function cronScheduler({ user, roomId }: { user: any; roomId: number }) {
    cron.schedule("0 0 * * * ", async () => {
        await prisma.room.deleteMany({
            where: {
                lastEmpty: {
                    lte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                },
            },
        })
    })
}
