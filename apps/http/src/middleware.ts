import { NextFunction, Request, Response } from "express"
import jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_SECRET } from "./config.js"

const requests: Map<string, { count: number; timeout: NodeJS.Timeout }> =
    new Map()

export const roomMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.headers["authorization"]

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
        console.log("end of middlware")
        next()
    } catch (e) {
        return res.status(403).json("Invalid token , Please try relogging in ")
    }
}

export const rateLimmiterMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const ipAddress = req.ip

    if (!ipAddress) {
        return res.status(403).json({
            msg: "Ip not found",
        })
    }

    const entry = requests.get(ipAddress)
    if (!entry) {
        requests.set(ipAddress, {
            count: 1,
            timeout: setTimeout(() => {
                requests.delete(ipAddress)
            }, 20 * 1000),
        })
        next()
    } else {
        const updatedCount = (entry.count ?? 0) + 1
        requests.set(ipAddress, { ...entry, count: updatedCount })

        if (entry.count > 20) {
            console.log("Rate limitter activated")
            return res
                .status(429)
                .json({ msg: "Calm down , Too many requests buddy" })
        }
    }
}
