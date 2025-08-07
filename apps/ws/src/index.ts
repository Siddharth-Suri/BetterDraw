import WebSocket, { WebSocketServer } from "ws"
import { prisma } from "@repo/db/client"
import cookie from "cookie"
import jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_SECRET, UserConnection } from "./config.js"

// cleanup the code a bit
// 1 . add a queue to slowly update messages to the db
// 2 . use less variables make code less verbose
// 3.  add try catches to make it safe
// 3 . GAME CHANGER : add Redis or Kafka or BOTH

const wss = new WebSocketServer({ port: 8080 })

const user: Map<number, UserConnection[]> = new Map([])

// Headers: Cookie
// roomToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsInJvb21JZCI6Miwicm9vbU5hbWVTbHVnIjoidGhlLXF1aWNrLXNpZ21hIiwicGFzc2NvZGUiOiJoYWhhU0lnbWFAMSIsInZlcmlmaWVkIjp0cnVlLCJpYXQiOjE3NTQ1ODEzMTd9.3q5KEicaALCpULQ9vTPN1ARvhyl7pGVoUKCiSfpFvAg
// {
//     "type":"message",
//     "message":"first message"
// }

wss.on("connection", (ws: WebSocket, req) => {
    const cookies = cookie.parse(req.headers.cookie || "")

    if (!cookies) {
        ws.close()
        return
    }

    const token = cookies.roomToken

    if (!token) {
        ws.close()
        return
    }

    let verifiedToken: JwtPayload
    try {
        verifiedToken = jwt.verify(token, JWT_SECRET) as JwtPayload
    } catch (e) {
        ws.close(404, "Incorrect Credentials ")
        return
    }
    const verified = verifiedToken.verified

    if (verified != true || !verifiedToken.userId) {
        ws.close()
        return
    }

    if (!user.has(verifiedToken.roomId)) {
        user.set(verifiedToken.roomId, [])
    }

    user.get(verifiedToken.roomId)?.push({
        userId: verifiedToken.userId,
        ws: ws,
    })

    ws.on("message", async function (incoming: string) {
        const parsedData = JSON.parse(incoming)

        const data = verifiedToken
        try {
            if (parsedData.type === "message") {
                const messageCreate = await prisma.chat.create({
                    data: {
                        message: parsedData.message,
                        userId: data.userId,
                        roomId: data.roomId,
                    },
                })
            }
        } catch {
            ws.close(500, "Server error while sending message")
        }
        const listOfUsers = user.get(verifiedToken.roomId)
        listOfUsers?.forEach((user) => {
            user.ws.send(parsedData.message)
        })
    })
    ws.on("close", () => {
        const users = user.get(verifiedToken.roomId)
        if (users) {
            user.set(
                verifiedToken.roomId,

                users.filter((x) => {
                    x.ws != ws
                })
            )
        }
    })
})
