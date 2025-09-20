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

const user: Map<number, UserConnection[]> = new Map([])

wss.on("connection", (ws: WebSocket, req) => {
    // verify logic and parsing
    console.log("Reached ws layer")
    const cookies = cookie.parse(req.headers.cookie || "")
    if (!cookies) {
        console.log("Missing cookies : Kindly enable cookies ")
        ws.close(4001, "Unauthorized")
        return
    }

    const token = cookies.roomToken

    if (!token) {
        console.log("Token is missing : Kindly try to login ")
        ws.close(4001, "Unauthorized")
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

    // extraction and adding in server state

    const { userId, roomId } = verifiedToken

    if (!user.has(roomId)) {
        user.set(roomId, [])
    }

    user.get(roomId)?.push({
        userId: userId,
        ws: ws,
    })

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
                console.log(parsedData)
                // here ->
                const message = JSON.stringify(parsedData.message)

                // redis here
                // const appendValue = storeValues({ message, roomId })

                // instead of awaiting be declare another function to make is " fire and forget "
                messageCreateFunction({ message, userId, roomId }).catch(
                    (e) => {
                        console.log("Db call failed " + e)
                    }
                )
            }
        } catch {
            ws.close(500, "Server error while sending message")
        }
        const listOfUsers = user.get(roomId)

        try {
            listOfUsers?.forEach((user) => {
                console.log("Message sent = " + parsedData.message)
                const stringMessage = JSON.stringify(parsedData)
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
                // add state updating or user map here
            }
        }
    })
})
