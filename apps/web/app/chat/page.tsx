"use client"
import { Button } from "@/components/ui/button"
import Cookies from "js-cookie"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import jwt from "jsonwebtoken"

export default function Chat() {
    let ws: WebSocket | null = null
    const [socket, setSocket] = useState<WebSocket | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [input, setInput] = useState("")
    const [username, setUsername] = useState<null | string>()
    const [messages, setMessages] = useState<object[]>([
        { input: "testing message  1" },
    ])

    const token = Cookies.get("authToken") ?? ""
    console.log(messages)
    useEffect(() => {
        if (!token) {
            setError(" Unauthorized access : Please try logging in ")
            return
        }
        let decoded = jwt.decode(token)
        if (!decoded || typeof decoded === "string") {
            setError("Invalid token")
            return
        }
        console.log(decoded)
        console.log(decoded.username)
        setUsername(decoded.username)
    }, [])

    useEffect(() => {
        async function credentials() {
            const credentials = await fetch(
                "http://localhost:3002/checktoken",
                {
                    credentials: "include",
                }
            )
            if (!credentials.ok) {
                setError(" Unauthorized access : Please try logging in ")
                return
            }
            console.log("connecting...")
            const ws = new WebSocket("ws://localhost:8080/")

            ws.onopen = () => {
                console.log("Connected to server")
                setSocket(ws)
            }

            ws.onmessage = (event) => {
                console.log(event.data)
                console.log(username)
                const data = JSON.parse(event.data)
                console.log(data.trimmedInput)
                setMessages((prev) => [...prev, { input: data.trimmedInput }])
            }
        }
        credentials()

        return () => ws?.close()
    }, [])

    const sendMessage = () => {
        const trimmedInput = input.trim()
        if (trimmedInput != "") {
            const message = JSON.stringify({
                type: "message",
                message: { trimmedInput },
            })
            if (socket) {
                socket.send(message)
            }
            setInput("")
        } else {
            alert("Message should not be empty")
        }
    }

    return (
        <div className="bg-gray-200 h-screen">
            {error ? (
                <div>
                    <div className="text-red-500 font-semibold">{error}</div>
                </div>
            ) : (
                <div>
                    <div className="flex justify-center  p-2">
                        {/* <div className="p-4">Room Name</div> */}
                        <div className="p-2 ">
                            <Input
                                className="bg-white"
                                defaultValue=""
                                placeholder="Type Message"
                                onChange={(e) => setInput(e.target.value)}
                            />
                        </div>
                        <div className="p-2">
                            <Button onClick={sendMessage}>Send</Button>
                        </div>
                    </div>

                    <div className="flex justify-center p-4">
                        <div className="w-full max-w-2xl  space-y-3">
                            {messages.map((msg, idx) => {
                                return (
                                    <div key={idx} className={`flex  `}>
                                        <div
                                            className={`flex items-center max-w-[70%] `}
                                        >
                                            <div className="flex p-3 rounded-l-2xl rounded-tr-2xl bg-gray-50 underline font-serif text-gray-700 dark:text-gray-300 mx-2">
                                                {username + ": "}
                                            </div>

                                            <div
                                                className={`p-3 rounded-2xl shadow-md text-white bg-blue-600 rounded-bl-none

                                                `}
                                            >
                                                {
                                                    //@ts-ignore
                                                    msg.input || msg
                                                }
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
