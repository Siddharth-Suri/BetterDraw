"use client"
import { Input } from "@/components/ui/input"
import { Label } from "@radix-ui/react-label"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Room() {
    const [state, setState] = useState<"join" | "create">("create")
    const [roomName, setRoomName] = useState<string | null>(null)
    const [roomPassword, setRoomPassword] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const route = useRouter()

    // manages join and create endpoints
    async function callHandler() {
        if (state === "create") {
            try {
                const res = await fetch("http://localhost:3002/createroom", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        roomName: roomName,
                        password: roomPassword,
                    }),
                })
                if (res.ok) {
                    route.push("/chat")
                } else {
                    const body = await res.json()
                    console.log(body?.msg)
                    setError(body?.msg)
                    return "Error"
                }
            } catch (e) {
                console.log("Something went wrong with the server")
            }
        } else if (state === "join") {
            try {
                const res = await fetch("http://localhost:3002/verifyroom", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        roomNameSlug: roomName,
                        passcode: roomPassword,
                    }),
                })
                if (res.ok) {
                    route.push("/chat")
                } else {
                    const body = await res.json()
                    console.log(body?.msg)
                    setError(body?.msg)

                    return "Error"
                }
            } catch (e) {
                console.log("Something went wrong with the server")
            }
        }
    }

    return (
        <div className="flex bg-gray-100 h-screen justify-center items-center align-middle">
            <div className="w-xl bg-white p-2 m-2 border-4 rounded-4xl border-black">
                {error ? (
                    <div className="flex m-2 justify-center font-semibold text-red-400">
                        <p>{error}</p>
                    </div>
                ) : (
                    <div></div>
                )}
                <div className="p-2 m-2">
                    <div className="p-2 m-2">
                        <Label className="font-semibold">Room Name:</Label>
                        <Input
                            onChange={(e) => {
                                setRoomName(e.target.value)
                            }}
                            placeholder="My room 1"
                        ></Input>
                    </div>
                    <div className="p-2 m-2">
                        <Label className="font-semibold">Room Password:</Label>
                        <Input
                            placeholder="Pass-2356"
                            type="password"
                            onChange={(e) => {
                                setRoomPassword(e.target.value)
                            }}
                        ></Input>
                    </div>
                </div>
                <div className="flex p-2  m-2 justify-center">
                    <div
                        className="p-3 pl-8 pr-8 m-2 border-2 rounded-xl bg-yellow-500 cursor-pointer"
                        onClick={() => {
                            setState("join")
                            callHandler()
                        }}
                    >
                        Join
                    </div>
                    <div
                        className="p-3 pl-6 pr-6 m-2 border-2 rounded-xl bg-green-500 cursor-pointer"
                        onClick={() => {
                            setState("create")
                            callHandler()
                        }}
                    >
                        Create
                    </div>
                </div>
            </div>
        </div>
    )
}
