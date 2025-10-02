"use client"
import { Button } from "@/components/ui/button"
import Cookies from "js-cookie"
import { Input } from "@/components/ui/input"
import { useEffect, useRef, useState } from "react"
import jwt from "jsonwebtoken"

export default function Chat() {
    let ws: WebSocket

    const [socket, setSocket] = useState<WebSocket | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [input, setInput] = useState("")
    const usernameRef = useRef<string | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const roomIdRef = useRef<number | null>(null)
    const [roomName, setRoomName] = useState<null | string>()
    const [messages, setMessages] = useState<object[]>([
        {
            type: "message",
            username: "Server Test",
            input: "testing message  1",
        },
    ])
    const [expandedMessages, setExpandedMessages] = useState<Set<number>>(
        new Set()
    )

    const token = Cookies.get("authToken") ?? ""
    const roomToken = Cookies.get("roomToken") ?? ""

    useEffect(() => {
        console.log("here")
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
        roomIdRef.current = roomTokenDecoded.roomId
        console.log("here")
        console.log(roomIdRef)
    }, [])

    useEffect(() => {
        async function credentials() {
            console.log("Connecting...")
            ws = new WebSocket("ws://localhost:8080/")
            ws.onopen = async () => {
                console.log("Connected to server")
                setSocket(ws)
                console.log("2nd effect")
                console.log(roomIdRef)
                const res = await fetch("http://localhost:3002/messages", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(roomIdRef),
                    credentials: "include",
                })
                console.log("Fetch ran ")
                if (!res.ok) return
                // need to be state instead of server memory
                const pastMessages = await res.json()
                pastMessages.map(async (message: any) => {
                    const res = message.message
                    const parsed = JSON.parse(res)

                    setMessages((prev) => [
                        ...prev,
                        {
                            type: "message",
                            username: JSON.parse(message.username),
                            input: parsed.trimmedInput ?? "",
                        },
                    ])
                })
            }

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data)

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
        setLoading(false)

        return () => ws.close()
    }, [])

    const sendMessage = () => {
        const trimmedInput = input.trim()
        if (trimmedInput != "") {
            const message = JSON.stringify({
                type: "message",
                username: usernameRef.current,
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
    console.log(messages)
    return (
        <div className="bg-gray-200 h-screen overflow-auto">
            {error ? (
                <div>
                    <div className="text-red-500 font-semibold">{error}</div>
                </div>
            ) : (
                <div>
                    {loading ? (
                        <div>Loading...</div>
                    ) : (
                        <div>
                            <div className="flex justify-center items-center p-2">
                                <div className="bg-black ronded-xl text-sm flex gap-2 p-2 rounded-lg pl-4 pr-4">
                                    <div className="font-normal text-white">
                                        {" # "} Room Name:{" "}
                                    </div>
                                    <div className="text-blue-400">
                                        {roomName}
                                    </div>
                                </div>
                                <div className="p-2">
                                    <Input
                                        className="bg-white"
                                        value={input}
                                        placeholder="Type Message"
                                        onChange={(e) =>
                                            setInput(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="p-2">
                                    <Button onClick={sendMessage}>Send</Button>
                                </div>
                            </div>

                            <div className="flex justify-center p-4">
                                <div className="w-full max-w-2xl space-y-3">
                                    {messages.map((msg, idx) => {
                                        let value = (msg as any).input
                                        if (!value) return null
                                        const isOwnMessage =
                                            (msg as any).username ===
                                            usernameRef.current
                                        const messageText =
                                            (msg as any).input || ""
                                        const wordLimit = 50
                                        const words = messageText
                                            .toString()
                                            .split(" ")
                                        const shouldTruncate =
                                            words.length > wordLimit
                                        const isExpanded =
                                            expandedMessages.has(idx)
                                        const displayText =
                                            shouldTruncate && !isExpanded
                                                ? words
                                                      .slice(0, wordLimit)
                                                      .join(" ")
                                                : messageText

                                        return (
                                            <div
                                                key={idx}
                                                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                                            >
                                                <div
                                                    className={`max-w-[70%] flex flex-col ${
                                                        isOwnMessage
                                                            ? "items-end"
                                                            : "items-start"
                                                    }`}
                                                >
                                                    {/* Username label */}
                                                    <span
                                                        className={`text-xs font-medium text-gray-600 mb-1 px-2 ${
                                                            isOwnMessage
                                                                ? "text-right"
                                                                : "text-left"
                                                        }`}
                                                    >
                                                        {
                                                            //@ts-ignore
                                                            msg.username
                                                        }
                                                    </span>

                                                    {/* Message bubble */}
                                                    <div
                                                        className={`px-4 py-2 rounded-2xl shadow-sm max-w-full break-words whitespace-pre-wrap ${
                                                            isOwnMessage
                                                                ? "bg-blue-600 text-white rounded-br-none"
                                                                : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                                                        }`}
                                                    >
                                                        <span>
                                                            {displayText}
                                                            {shouldTruncate && (
                                                                <button
                                                                    className={`ml-2 underline text-sm ${
                                                                        isOwnMessage
                                                                            ? "text-blue-100 hover:text-white"
                                                                            : "text-blue-600 hover:text-blue-800"
                                                                    }`}
                                                                    onClick={() => {
                                                                        setExpandedMessages(
                                                                            (
                                                                                prev
                                                                            ) => {
                                                                                const newSet =
                                                                                    new Set(
                                                                                        prev
                                                                                    )
                                                                                if (
                                                                                    newSet.has(
                                                                                        idx
                                                                                    )
                                                                                ) {
                                                                                    newSet.delete(
                                                                                        idx
                                                                                    )
                                                                                } else {
                                                                                    newSet.add(
                                                                                        idx
                                                                                    )
                                                                                }
                                                                                return newSet
                                                                            }
                                                                        )
                                                                    }}
                                                                >
                                                                    {isExpanded
                                                                        ? "show less"
                                                                        : "show more"}
                                                                </button>
                                                            )}
                                                        </span>
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
            )}
        </div>
    )
}
