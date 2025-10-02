"use client"
import { Input } from "@/components/ui/input"
import { Label } from "@radix-ui/react-label"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Room() {
    const [roomName, setRoomName] = useState<string>("")
    const [roomPassword, setRoomPassword] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const route = useRouter()

    async function callHandler(mode: "join" | "create") {
        const url =
            mode === "create"
                ? "http://localhost:3002/createroom"
                : "http://localhost:3002/verifyroom"

        const payload =
            mode === "create"
                ? { roomName, password: roomPassword }
                : { roomNameSlug: roomName, passcode: roomPassword }

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include",
            })
            setLoading(false)
            if (res.ok) {
                route.push("/chat")
            } else {
                const body = await res.json()
                setError(body?.msg)
            }
        } catch (e) {
            setLoading(false)
            console.log("Something went wrong with the server")
        }
    }

    return (
        <div className={`${loading ? "cursor-wait" : "cursor-pointer"}`}>
            <div className="flex bg-gray-100 h-screen justify-center items-center">
                <div className="w-xl bg-white p-2 m-2 border-4 rounded-4xl border-black">
                    {error && (
                        <div className="flex m-2 justify-center font-semibold text-red-400">
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="p-2 m-2">
                        <div className="p-2 m-2">
                            <Label className="font-semibold">Room Name:</Label>
                            <Input
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                placeholder="My room 1"
                            />
                        </div>
                        <div className="p-2 m-2">
                            <Label className="font-semibold">
                                Room Password:
                            </Label>
                            <Input
                                value={roomPassword}
                                placeholder="Pass-2356"
                                type="password"
                                onChange={(e) =>
                                    setRoomPassword(e.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="flex p-2 m-2 justify-center">
                        <div
                            className="p-3 px-8 m-2 border-2 rounded-xl bg-yellow-500 cursor-pointer"
                            onClick={() => {
                                setLoading(true)
                                callHandler("join")
                            }}
                        >
                            Join
                        </div>
                        <div
                            className="p-3 px-6 m-2 border-2 rounded-xl bg-green-500 cursor-pointer"
                            onClick={() => {
                                setLoading(true)
                                callHandler("create")
                            }}
                        >
                            Create
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
