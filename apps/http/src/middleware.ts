import { NextFunction, Request, Response } from "express"
import jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_SECRET } from "./config.js"
import client from "./redis.js"

const requests: Map<string, { count: number; timeout: NodeJS.Timeout }> =
    new Map()

export const roomMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.cookies["authToken"]
    if (!token) {
        return res.status(403).json({
            msg: "Missing Token , Please log in first ",
        })
    }
    try {
        const response = jwt.verify(token, JWT_SECRET)

        if (!response || typeof response === "string") {
            return res.status(403).json({
                msg: "Invalid credentials , Please try logging in",
            })
        }

        req.userId = response.userId
        console.log("end of middlware 1")
        next()
    } catch (e) {
        return res.status(403).json("Invalid token , Please try relogging in ")
    }
}

export const rateLimmiterMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const ipAddress = req.ip
        const key = `ratelimit:${ipAddress}`
        const requests = await client.incr(key)
        if (requests === 1) {
            await client.expire(key, 80)
        }
        if (requests > 80) {
            console.log("Too many requests")
            res.status(429).json({ msg: "Too many requests" })
        }
        console.log("Passed")
        next()
    } catch (e) {
        console.log("Rate limiter error" + e)
        next()
    }
}
