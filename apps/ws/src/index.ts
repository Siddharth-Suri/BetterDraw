import WebSocket, { WebSocketServer } from "ws"
import { prisma } from "@repo/db/client"
import cookie from "cookie"
import jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_SECRET } from "./config.js"
import { CascadeValue, UserConnection, messageCreateFunction } from "./lib.js"
import { getValues, storeValues } from "http/redis"
// cleanup the code a bit
// 1 . add a queue to slowly update messages to the db
// 3 . GAME CHANGER : add Redis or Kafka or BOTH

const wss = new WebSocketServer({ port: 8080 })

// users should be slowly pushed to db
const user: Map<number, UserConnection[]> = new Map([])

// Headers: Cookie
// roomToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsInJvb21JZCI6Miwicm9vbU5hbWVTbHVnIjoidGhlLXF1aWNrLXNpZ21hIiwicGFzc2NvZGUiOiJoYWhhU0lnbWFAMSIsInZlcmlmaWVkIjp0cnVlLCJpYXQiOjE3NTQ1ODEzMTd9.3q5KEicaALCpULQ9vTPN1ARvhyl7pGVoUKCiSfpFvAg
// {
//     "type":"message",
//     "message":"first message"
// }

wss.on("connection", (ws: WebSocket, req) => {
    // -------verify logic and parsing --------

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

        if (verifiedToken.verified != true || !verifiedToken.userId) {
            ws.close()
            return
        }
    } catch (e) {
        ws.close(404, "Incorrect Credentials ")
        return
    }

    // -------extraction and adding in server state--------

    const { userId, message, roomId } = verifiedToken

    if (!user.has(roomId)) {
        user.set(roomId, [])
    } else {
        user.get(roomId)?.push({
            userId: userId,
            ws: ws,
        })
    }

    ws.on("message", async function (incoming: string) {
        const parsedData = JSON.parse(incoming)
        // 1. add state to redis first and then to ps
        // 2. clear state from redis whenever new messaage and add state whenever you try to get cachedd data for first user
        // 3. add save button to push to ps instead of awaiting every message or just push to redis and then later store to ps maybe

        const cachedMessages = getValues({ roomId })

        try {
            if (parsedData.type === "message") {
                const appendValue = storeValues({ message, roomId })
                // instead of awaiting be declare another function to make is " fire and forget "
                messageCreateFunction({ message, userId, roomId }).catch(() => {
                    console.log("Db call failed")
                })
            }
        } catch {
            ws.close(500, "Server error while sending message")
        }
        const listOfUsers = user.get(roomId)
        listOfUsers?.forEach((user) => {
            user.ws.send(parsedData.message)
        })
    })

    ws.on("close", async () => {
        const users = user.get(roomId)
        if (users) {
            const filteredUsers = users.filter((x) => {
                return x.ws != ws
            })
            if (filteredUsers.length > 0) {
                user.set(roomId, filteredUsers)
            } else {
                user.delete(roomId)
            }
        }
        // Add this whenever you make the user changes to the db persistent

        CascadeValue({ roomId }).catch((e) => {
            console.log("Error while cascading " + e)
        })
    })
})
