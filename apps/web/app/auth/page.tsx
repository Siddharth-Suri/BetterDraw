"use client"

// import { AppWindowIcon, CodeIcon } from "lucide-react"
import { SignUpSchema, SignInSchema } from "@repo/common/types"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState } from "react"

export default function AuthPage() {
    // set modes for react hook to distinguish bw login and signup
    const [mode, setMode] = useState<"signin" | "signup">("signup")
    console.log(mode)
    const schema = mode === "signup" ? SignUpSchema : SignInSchema

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm({
        resolver: zodResolver(schema),
    })

    const onSubmit = async (data: any) => {
        console.log(data)
        try {
            let response = null
            response = await fetch(`http://localhost:3002/${mode}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
            if (!response.ok) {
                if (response.status === 400) {
                    alert("Validation Failed")
                } else if (response.status === 409) {
                    alert("User already exists")
                } else {
                    alert("Unexpected server error , Please try again later")
                }
            }

            const token = await response.json()
            localStorage.setItem("authToken", token)
        } catch (e) {
            console.log("Server error : " + e)
            alert("Server failed to connect")
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center w-full bg-background">
            <div className="flex justify-center w-full max-w-lg flex-col gap-6 ">
                <Tabs
                    value={mode}
                    onValueChange={(val) => setMode(val as "signup" | "signin")}
                    className="mb-6 w-full"
                    defaultValue="signup"
                >
                    <TabsList className="w-full">
                        <TabsTrigger value="signup">Signup</TabsTrigger>
                        <TabsTrigger value="signin">Signin</TabsTrigger>
                    </TabsList>
                    <TabsContent value="signup">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">
                                    Create Account
                                </CardTitle>
                                <CardDescription>
                                    Make your new account here. Click save when
                                    you&apos;re done.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-6">
                                <div className="grid gap-3">
                                    <Label htmlFor="tabs-demo-name">
                                        Email
                                    </Label>
                                    <Input
                                        {...register("email")}
                                        id="tabs-demo-name"
                                        defaultValue=""
                                        placeholder="johndoe@example.com"
                                    />
                                    {errors.email && (
                                        <p className="text-red-500">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="tabs-demo-name">
                                        Username
                                    </Label>
                                    <Input
                                        {...register("username")}
                                        id="tabs-demo-username"
                                        defaultValue=""
                                        placeholder="john-doe"
                                    />
                                    {errors?.username && (
                                        <p className="text-red-500">
                                            {errors?.username.message}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="tabs-demo-new">
                                        Password
                                    </Label>
                                    <Input
                                        {...register("password")}
                                        placeholder="xyz@12345"
                                        id="tabs-demo-new"
                                        type="password"
                                    />
                                    {errors.password && (
                                        <p className="text-red-500">
                                            {errors.password.message}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                            <div className="flex w-full p-1 justify-center">
                                <CardFooter className="w-full">
                                    <Button
                                        className="w-full cursor-pointer"
                                        size="lg"
                                        onClick={() => {
                                            console.log("handler called")
                                            handleSubmit(onSubmit)()
                                            console.log("after handler called")
                                        }}
                                    >
                                        Proceed
                                    </Button>
                                </CardFooter>
                            </div>
                        </Card>
                    </TabsContent>
                    <TabsContent className="w-full" value="signin">
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle className="text-xl">
                                    Sign in to your existing account
                                </CardTitle>
                                <CardDescription>
                                    Enter your email and password to access your
                                    account
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-6">
                                <div className="grid gap-3">
                                    <Label htmlFor="tabs-demo-name">
                                        Email
                                    </Label>
                                    <Input
                                        {...register("email")}
                                        id="tabs-demo-name"
                                        defaultValue=""
                                        placeholder="johndoe@example.com"
                                        required
                                    />
                                    {errors.email && (
                                        <p className="text-red-500">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="tabs-demo-new">
                                        Password
                                    </Label>
                                    <Input
                                        {...register("password")}
                                        placeholder="xyz@12345"
                                        id="tabs-demo-new"
                                        type="password"
                                        required
                                    />
                                    {errors.password && (
                                        <p className="text-red-500">
                                            {errors.password.message}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                            <div className="flex w-full p-1 justify-center">
                                <CardFooter className="w-full">
                                    <Button
                                        className="w-full cursor-pointer"
                                        size="lg"
                                        onClick={() => {
                                            console.log("handler called")
                                            handleSubmit(onSubmit)()
                                            console.log("after handler called")
                                        }}
                                    >
                                        Proceed
                                    </Button>
                                </CardFooter>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
