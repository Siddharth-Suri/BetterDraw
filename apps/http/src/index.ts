import express from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "./config.js"
import { roomMiddleware } from "./middleware.js"
import { prisma } from "@repo/db/client"
import { SignUpSchema, SignInSchema, roomSchema } from "@repo/common/types"
import bcrypt from "bcrypt"
import { createSlug } from "@repo/common/slug"

const app = express()
const port = 3002
const saltRounds = 7

app.use(express.json())

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
    const credentials = SignUpSchema.safeParse(req.body)

    if (!credentials.success) {
        console.log(credentials)
        return res.status(403).json({ msg: "Incorrect Credentials Sent" })
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
        return res.status(200).json({ userId: user.id })
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
    const credentials = SignInSchema.safeParse(req.body)
    //make database call here to verify cred

    if (!credentials.success) {
        console.log(credentials)
        return res.status(404).json({
            msg: "Choose better credentials blud",
        })
    }

    try {
        const user = await prisma.user.findFirst({
            where: {
                email: credentials.data?.email,
            },
        })

        if (!user) {
            console.log(user)
            return res.json({ msg: "Incorrect Credentials while signing in" })
        }
        const isPasswordCorrect = await bcrypt.compare(
            credentials.data?.password,
            user.password
        )
        if (!isPasswordCorrect) {
            return res.json({ msg: "Incorrect Credentials while signing in" })
        }
        const payload = {
            userId: user.id,
            email: credentials.data?.email,
        }

        const token = jwt.sign(payload, JWT_SECRET)
        res.status(200).send(token)
    } catch (e) {
        return res.status(500).json({
            msg: "Server error while siging in",
        })
    }
})

// Create room endpoint (send the token in params)
// {
//     "roomName": "the Quick SIgma",
//     "password": "hahaSIgma@1"
// }
// retuned
// {
//     "roomNameSlug": "the-quick-sigma",
//     "roomId": 2
// }

app.get("/createroom", roomMiddleware, async (req, res) => {
    const userId = req.userId
    const roomCredentials = roomSchema.safeParse(req.body)
    if (!roomCredentials.success) {
        return res.status(403).json({
            msg: "Error while parsing Password or Name",
        })
    }
    if (!userId) {
        return res.status(500).json({
            msg: "Something went wrong while creating room",
        })
    }
    const sluggedRoomName = createSlug(roomCredentials.data?.roomName)

    try {
        const room = await prisma.room.create({
            data: {
                adminId: Number(userId),
                roomNameSlug: sluggedRoomName,
                roomPassword: roomCredentials.data?.password,
            },
        })
        res.status(200).json({
            roomNameSlug: sluggedRoomName,
            roomId: room.roomId,
        })
    } catch (e) {
        return res.status(500).json({
            msg: "Error while creating room" + e,
        })
    }
})

app.post("/verifyroom", roomMiddleware, async (req, res) => {
    const userId = req.userId
    console.log("reached here  ")
    const { roomNameSlug, passcode } = req.body
    const roomData = await prisma.room.findFirst({
        where: {
            roomNameSlug,
        },
    })
    console.log("reached here 1 ")
    if (!roomData) {
        return res.status(404).json({ msg: "Room not found" })
    }

    const password = roomData?.roomPassword
    console.log("reached here 1.5 ")

    if (passcode === password) {
        const payload = {
            userId: userId,
            roomId: roomData.roomId,
            roomNameSlug: roomData.roomNameSlug,
            passcode,
            verified: true,
        }
        console.log("reached here 2 ")
        const token = jwt.sign(payload, JWT_SECRET)
        res.status(200).cookie("roomToken", token).send(token)
        console.log("reached here 3 ")
        return
    } else {
        return res.status(404).json({ msg: "Passcode is incorrect" })
    }
})

app.listen(port, () => {
    console.log("connected to port" + port)
})
