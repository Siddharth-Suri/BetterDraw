import { z } from "zod"

export const SignUpSchema = z.object({
    email: z.email(),
    password: z.string().max(20).min(8),
    username: z.string().min(3),
})

export const SignInSchema = z.object({
    email: z.email(),
    password: z.string().max(20).min(8),
})

export const roomSchema = z.object({
    roomName: z.string().min(3),
    password: z.string().min(3).max(20),
})
