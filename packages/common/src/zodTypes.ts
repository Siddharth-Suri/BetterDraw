import { z } from "zod"

export const SignUpSchema = z.object({
    email: z.email("Invalid Email"),
    password: z
        .string()
        .max(20, "Password should be between 8 to 20 letters")
        .min(8, "Password should be between 8 to 20 letters"),
    username: z.string().min(3, "Username is too Short"),
})

export const SignInSchema = z.object({
    email: z.email("Invalid Email"),
    password: z
        .string()
        .max(20, "Password should be between 8 to 20 letters")
        .min(8, "Password should be between 8 to 20 letters"),
})

export const roomSchema = z.object({
    roomName: z.string().min(3, "Room name should atleast be 2 characters"),
    password: z
        .string()
        .max(20, "Password should be between 3 to 20 letters")
        .min(3, "Password should be between 3 to 20 letters"),
})
