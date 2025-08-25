import { AppWindowIcon, CodeIcon } from "lucide-react"

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

export default function TabsDemo() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex justify-center w-full max-w-lg flex-col gap-6 ">
                <Tabs className="mb-6 w-full" defaultValue="account">
                    <TabsList className="w-full">
                        <TabsTrigger value="account">Signup</TabsTrigger>
                        <TabsTrigger value="password">Signin</TabsTrigger>
                    </TabsList>
                    <TabsContent value="account">
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
                                        id="tabs-demo-name"
                                        defaultValue=""
                                        placeholder="johndoe@example.com"
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="tabs-demo-name">
                                        Username
                                    </Label>
                                    <Input
                                        id="tabs-demo-username"
                                        defaultValue=""
                                        placeholder="john-doe"
                                    />
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="tabs-demo-new">
                                        Password
                                    </Label>
                                    <Input
                                        placeholder="xyz@12345"
                                        id="tabs-demo-new"
                                        type="password"
                                    />
                                </div>
                            </CardContent>
                            <div className="flex p-1 justify-center">
                                <CardFooter>
                                    <Button size="lg">Proceed</Button>
                                </CardFooter>
                            </div>
                        </Card>
                    </TabsContent>
                    <TabsContent value="password">
                        <Card>
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
                                        id="tabs-demo-name"
                                        defaultValue=""
                                        placeholder="johndoe@example.com"
                                    />
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="tabs-demo-new">
                                        Password
                                    </Label>
                                    <Input
                                        placeholder="xyz@12345"
                                        id="tabs-demo-new"
                                        type="password"
                                    />
                                </div>
                            </CardContent>
                            <div className="flex p-1 justify-center">
                                <CardFooter>
                                    <Button size="lg">Proceed</Button>
                                </CardFooter>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
