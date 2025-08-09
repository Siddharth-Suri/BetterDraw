"use client"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { SignUpSchema } from "@repo/common/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
type SignUpType = z.infer<typeof SignUpSchema>

export default function SignUp() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignUpType>({
        resolver: zodResolver(SignUpSchema),
    })

    const onSubmit = async (data: SignUpType) => {
        const response = await fetch("http://localhost:3002/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
        if (!response.ok) {
            const { error } = await response.json()
            alert(error)
            return
        }
    }

    return (
        <div className="flex w-96 h-2/6 items-center justify-center border-2 rounded-2xl bg-neutral-800">
            <div className="p-4 rounded-2xl text-white text-lg">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid p-2 w-full max-w-sm items-center gap-3">
                        <Label htmlFor="email">Email</Label>

                        <Input
                            {...register("email")}
                            type="email"
                            id="email"
                            placeholder="Email"
                        />
                        {errors.email?.message && (
                            <p className="text-sm text-red-500">
                                {errors.email?.message}
                            </p>
                        )}
                    </div>
                    <div className="p-2 grid w-full max-w-sm items-center gap-3">
                        <Label htmlFor="password">Password</Label>

                        <Input
                            {...register("password")}
                            type="password"
                            id="password"
                            placeholder="password"
                        />
                        {errors.password?.message && (
                            <p className="text-sm text-red-500">
                                {errors.password?.message}
                            </p>
                        )}
                    </div>
                    <div className="grid p-2 w-full max-w-sm items-center gap-3">
                        <Label htmlFor="name">Username</Label>

                        <Input
                            {...register("username")}
                            type="username"
                            id="username"
                            placeholder="username"
                        />
                        {errors.username?.message && (
                            <p className="text-sm text-red-500">
                                {errors.username?.message}
                            </p>
                        )}
                    </div>

                    <div className="p-2">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Signing up..." : "Sign Up"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
