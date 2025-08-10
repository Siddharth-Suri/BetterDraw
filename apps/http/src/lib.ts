import type { Room, User } from "@prisma/client"
import { prisma } from "@repo/db/client"

export async function checkUserExists({
    username,
    email,
}: {
    username: string
    email: string
}): Promise<User | null> {
    let userExists: User | null = null

    try {
        userExists = await prisma.user.findFirst({
            where: {
                OR: [{ username: username }, { email: email }],
            },
        })
    } catch {
        throw Error
    }

    return userExists
}
