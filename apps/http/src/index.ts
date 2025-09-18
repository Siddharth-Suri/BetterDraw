import express, { Response } from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "./config.js"
import { roomMiddleware, rateLimmiterMiddleware } from "./middleware.js"
import { prisma } from "@repo/db/client"
import { SignUpSchema, SignInSchema, roomSchema } from "@repo/common/types"
import bcrypt from "bcrypt"
import { createSlug } from "@repo/common/slug"
import type { Room, User, Chat } from "@prisma/client"
import { z } from "zod"
import { checkUserExists } from "./lib.js"
// import { getValues } from "./redis.js"
import { cookieUser } from "./lib.js"

type message = {
    type: string
    xValue: number
    yValue: number
    colour: string
}

const app = express()
const port = 3002
const saltRounds = 7
import cors from "cors"

// Todo :
// 1. Add a common function that can be used in signup and signin and send tokens  to remove reoccuring
// logic and so user doesnt have to sign up twice , do same with createroom
// 2. Add more type safety and try catches
// 3. Make sure if a there is no user in the room the room self destructs in some time

app.use(express.json())
app.use(cors())
app.use(rateLimmiterMiddleware)

const hashMyPassword = async (password: string) => {
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    return hashedPassword
}

// Sign Up endpoint
// {
//     "email": "user@gmail.com",
//     "password": "hahaSIgma@1",
//     "username": "seconduser"
// }

app.post("/signup", async (req, res) => {
    console.log("hit")
    const credentials = SignUpSchema.safeParse(req.body)

    if (!credentials.success) {
        return res.status(400).json({
            msg: "Incorrect Credentials Sent",
            errors: z.treeifyError(credentials.error),
        })
    }

    const userExists = await checkUserExists({
        username: credentials.data.username,
        email: credentials.data.email,
    })

    if (userExists) {
        return res.status(409).json({
            msg: "User already Exists ",
        })
    }

    const hashedPassword = await hashMyPassword(credentials.data?.password)

    try {
        const user = await prisma.user.create({
            data: {
                username: credentials.data?.username,
                password: hashedPassword,
                email: credentials.data?.email,
            },
        })
        const payload = {
            userId: user.id,
            email: credentials.data?.email,
        }

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" })
        return res.status(200).json(token)
    } catch (e) {
        return res.status(500).json({
            msg: "Something went wrong while signing up",
        })
    }
})

// SignIN
// {
//     "email": "user@gmail.com",
//     "password": "hahaSIgma@1"
// }
// token : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoidXNlckBnbWFpbC5jb20iLCJpYXQiOjE3NTQ1ODA1MzB9.qpZbuYkwiu4jI-sC73E3haw34gPbh4CiBL61E07kY1o

// put it inside the headers

app.post("/signin", async (req, res) => {
    const credentials = SignInSchema.safeParse(await req.body)

    if (!credentials.success) {
        return res.status(400).json({
            msg: "Incorrect Credentials Sent",
            errors: z.treeifyError(credentials.error),
        })
    }

    try {
        const user = await prisma.user.findFirst({
            where: {
                email: credentials.data?.email,
            },
        })

        if (!user) {
            // need to check frontend here for possible no values found in server
            return res
                .status(409)
                .json({ msg: "Incorrect Credentials while signing in" })
        }

        const isPasswordCorrect = await bcrypt.compare(
            credentials.data?.password,
            user.password
        )
        if (!isPasswordCorrect) {
            return res
                .status(400)
                .json({ msg: "Incorrect Credentials while signing in" })
        }
        const payload = {
            userId: user.id,
            email: credentials.data?.email,
        }

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" })
        res.status(200).json(token)
    } catch (e) {
        return res.status(500).json({
            msg: "Server error while siging in",
        })
    }
})

// Create room endpoint (send the token in params)
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
//     .eyJ1c2VySWQiOjcsImVtYWlsIjoidGhpcmR1c2VyQGdtYWlsLmNvbSIsImlhdCI6MTc1NTcwNjE0OSwiZXhwIjoxNzU1NzkyNTQ5fQ
//     .GhxjPZH24keRFSF1o8k2oik8s8kJLkn1qzFuIaWAbRQ
// {
//     "roomName": "the Quick SIgma",
//     "password": "hahaSIgma@1"
// }
// retuned
// {
//     "roomNameSlug": "the-quick-sigma",
//     "roomId": 2
// }

app.post("/createroom", roomMiddleware, async (req, res) => {
    const userId = req.userId
    const roomCredentials = roomSchema.safeParse(req.body)

    if (!userId) {
        return res.status(500).json({
            msg: "Something went wrong in room middleware while creating room",
        })
    }
    const userIdNumber = Number(userId)

    if (!roomCredentials.success) {
        return res.status(403).json({
            msg: "Error while parsing Password or Name",
            errors: z.treeifyError(roomCredentials.error),
        })
    }

    const sluggedRoomName = createSlug(roomCredentials.data?.roomName)
    let room
    try {
        room = await prisma.room.create({
            data: {
                adminId: Number(userId),
                roomNameSlug: sluggedRoomName,
                roomPassword: roomCredentials.data?.password,
            },
        })
        res.status(200)
    } catch (e) {
        return res.status(500).json({
            msg: "Error while creating room" + e,
        })
    }

    const payload: cookieUser = {
        userId: userIdNumber,
        roomId: room.roomId,
        roomNameSlug: room.roomNameSlug,
        passcode: roomCredentials.data.password,
        verified: true,
    }
    try {
        const token = jwt.sign(payload, JWT_SECRET)
        res.status(200).cookie("roomToken", token).json({
            roomNameSlug: sluggedRoomName,
            roomId: room.roomId,
        })
        return
    } catch {
        res.status(404).json({
            msg: "The roomToken is invalid ",
        })
        return
    }
})

// Need to send auth token for middleware
// Need to send passcode and roomNameSlug
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsInJvb21JZCI6Niwicm9vbU5hbWVTbHVnIjoiZGlzY29yZCIsInBhc3Njb2RlIjoiSGF6ZXkiLCJ2ZXJpZmllZCI6dHJ1ZSwiaWF0IjoxNzU1ODc2MDkwfQ.rWWwAlG9S3kLi_6gD7pVsrfzUGTHgMmAQyCyPmUaZG4

app.post("/verifyroom", roomMiddleware, async (req, res) => {
    const userId = req.userId
    if (!userId) {
        res.status(404).json({
            msg: "userId not sent",
        })
        return
    }
    const userIdNumber = Number(userId)
    const { roomNameSlug, passcode } = req.body
    const sluggedRoomName = createSlug(roomNameSlug)

    let roomData: Room | null
    try {
        roomData = await prisma.room.findFirst({
            where: {
                roomNameSlug: sluggedRoomName,
            },
        })
    } catch (e) {
        return res.status(500).json({
            msg: "Server error , Failed to retrieve from database",
        })
    }

    if (!roomData) {
        return res.status(404).json({ msg: "Room not found" })
    }

    const password = roomData?.roomPassword

    if (passcode === password) {
        const payload: cookieUser = {
            userId: userIdNumber,
            roomId: roomData.roomId,
            roomNameSlug: sluggedRoomName,
            passcode,
            verified: true,
        }
        try {
            const token = jwt.sign(payload, JWT_SECRET)
            res.status(200).cookie("roomToken", token).send(token)
            return
        } catch {
            res.status(404).json({
                msg: "The roomToken is invalid ",
            })
            return
        }
    } else {
        return res.status(404).json({ msg: "Passcode is incorrect" })
    }
})

app.get("/messages", async (req, res) => {
    // we need to get past messages
    const { roomId } = req.body
    let cachedMessages = null
    // try {
    //     cachedMessages = await getValues(roomId)
    // } catch (e) {}

    if (cachedMessages) {
        //map over the array and return values
        return cachedMessages
    } else {
        const dbMessages = await prisma.chat.findMany({
            where: {
                roomId: roomId,
            },
        })
        return dbMessages
    }
})

app.listen(port, () => {
    console.log("connected to port" + port)
})
