import { NextFunction, Request, Response } from "express"
import jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_SECRET } from "./config.js"
export const roomMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.headers["authorization"]

    if (!token) {
        return res.status(403).json({
            msg: "Invalid credentials",
        })
    }
    try {
        const response = jwt.verify(token, JWT_SECRET)

        if (!response || typeof response === "string") {
            return res.status(403).json({
                msg: "Invalid credentials",
            })
        }

        req.userId = response.userId
        console.log("end of middlware")
        next()
    } catch (e) {
        return res.status(403).json("Invalid token")
    }
}
