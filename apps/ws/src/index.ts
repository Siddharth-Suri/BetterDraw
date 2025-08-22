import WebSocket, { WebSocketServer } from "ws"
import { prisma } from "@repo/db/client"
import cookie from "cookie"
import jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_SECRET } from "./config.js"
import {
    CascadeValue,
    UserConnection,
    messageCreateFunction,
    updateUser,
} from "./lib.js"
import { getValues, storeValues } from "http/redis"
import { cookieUser } from "http/lib"

// TODO : FIX FOREIGN KEY CONSTRAINT , MAKE SURE ROOM ISNT IMMEDIATELY DELETED AND DELTED AFTER SUPPOSE 1 DAY OF NO MEMBERS

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
    console.log("here")
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

    let verifiedToken: cookieUser
    try {
        verifiedToken = jwt.verify(token, JWT_SECRET) as cookieUser

        if (verifiedToken.verified != true || !verifiedToken.userId) {
            ws.close()
            return
        }
    } catch (e) {
        ws.close(404, "Incorrect Credentials ")
        return
    }

    // -------extraction and adding in server state--------

    const { userId, roomId } = verifiedToken

    if (!user.has(roomId)) {
        user.set(roomId, [])
    }

    user.get(roomId)?.push({
        userId: userId,
        ws: ws,
    })

    // need to add message receiving logic here

    ws.on("message", async function (incoming: string) {
        // here parsedData would give a type and shol
        let parsedData: any
        try {
            parsedData = JSON.parse(incoming)
        } catch {
            console.log("Message is not a JSON")
            return
        }
        // redis caching values
        // const cachedMessages = getValues({ roomId })

        try {
            if (parsedData.type === "message") {
                // here ->
                const message = JSON.stringify(parsedData.message)
                console.log(message)
                // redis here
                // const appendValue = storeValues({ message, roomId })
                console.log("control reached here 1")
                // instead of awaiting be declare another function to make is " fire and forget "
                messageCreateFunction({ message, userId, roomId }).catch(
                    (e) => {
                        console.log("Db call failed " + e)
                    }
                )
                console.log("control reached here 2")
            }
        } catch {
            ws.close(500, "Server error while sending message")
        }
        const listOfUsers = user.get(roomId)

        try {
            listOfUsers?.forEach((user) => {
                console.log("Message sent = " + parsedData.message)
                const stringMessage = JSON.stringify(parsedData.message)
                user.ws.send(stringMessage)
            })
        } catch (e) {
            console.log("Error while seding message")
            return
        }
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
                updateUser({ roomId })
            }
        }
    })
})
