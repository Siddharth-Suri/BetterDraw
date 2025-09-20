"use client"
import { Button } from "@/components/ui/button"
import Cookies from "js-cookie"
import { Input } from "@/components/ui/input"
import { useEffect, useRef, useState } from "react"
import jwt from "jsonwebtoken"

export default function Chat() {
    let ws: WebSocket | null = null
    const [socket, setSocket] = useState<WebSocket | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [input, setInput] = useState("")
    const usernameRef = useRef<string | null>(null)

    const [roomName, setRoomName] = useState<null | string>()
    const [messages, setMessages] = useState<object[]>([
        { username: "Server Test", input: "testing message  1" },
    ])

    const token = Cookies.get("authToken") ?? ""
    const roomToken = Cookies.get("roomToken") ?? ""

    useEffect(() => {
        if (!token || !roomToken) {
            setError(" Unauthorized access : Please try logging in ")
            return
        }
        let roomTokenDecoded = jwt.decode(roomToken)
        let decoded = jwt.decode(token)
        if (
            !decoded ||
            typeof decoded === "string" ||
            !roomTokenDecoded ||
            typeof roomTokenDecoded === "string"
        ) {
            setError("Invalid token")
            return
        }
        setRoomName(roomTokenDecoded.roomNameSlug)
        usernameRef.current = decoded.username
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
                const data = JSON.parse(event.data)
                console.log("Step 1")
                console.log(event)
                console.log("Step 2")
                console.log(messages)
                console.log("Step 3")
                console.log(data)
                console.log("Step 7")
                console.log(data.username)

                setMessages((prev) => [
                    ...prev,
                    {
                        type: data.type,
                        username: data.username,
                        input: data.message.trimmedInput,
                    },
                ])
            }
        }
        credentials()

        return () => ws?.close()
    }, [])

    const sendMessage = () => {
        const trimmedInput = input.trim()
        if (trimmedInput != "") {
            console.log("Step 4" + usernameRef.current)

            const message = JSON.stringify({
                type: "message",
                username: usernameRef.current,
                message: { trimmedInput },
            })
            console.log("Step 5" + message)

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
                    <div className="flex  justify-center items-center  p-2">
                        <div className="bg-black ronded-xl text-sm flex gap-2 p-2 rounded-lg pl-4 pr-4">
                            <div className="font-normal text-white">
                                {" # "}
                                Room Name:{" "}
                            </div>
                            <div className="text-blue-400 ">{roomName}</div>
                        </div>
                        <div className="p-2 ">
                            <Input
                                className="bg-white"
                                value={input}
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
                                                {
                                                    //@ts-ignore
                                                    msg.username + ": "
                                                }
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
