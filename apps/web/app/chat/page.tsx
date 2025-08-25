"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"

export default function Chat() {
    const [socket, setSocket] = useState<WebSocket | null>(null)
    const [messages, setMessages] = useState<object[]>([
        { input: "testing message  1" },
        { input: "testing message 2" },
    ])
    const [input, setInput] = useState("")

    useEffect(() => {
        console.log("connecting...")
        const ws = new WebSocket("ws://localhost:8080/")

        ws.onopen = () => {
            console.log("Connected to server")
            setSocket(ws)
        }

        ws.onmessage = (event) => {
            console.log(event.data)
            const data = JSON.parse(event.data)
            setMessages((prev) => [...prev, data])
        }

        return () => ws.close()
    }, [])

    const sendMessage = () => {
        const message = JSON.stringify({
            type: "message",
            message: { input },
        })
        if (socket && input.trim()) {
            socket.send(message)
            setInput("")
        }
    }

    return (
        <div className="">
            <div className=" flex justify-center p-2">
                <div className="p-2">
                    <Input
                        placeholder="Type Message"
                        onChange={(e) => setInput(e.target.value)}
                    ></Input>
                </div>
                <div className="p-2">
                    <Button onClick={sendMessage}>Send</Button>
                </div>
            </div>
            <div className="flex justify-center">
                <div className="">
                    {messages.map((msg, idx) => (
                        <div
                            className="m-0.5 p-0.5 pl-2 pr-2 bg-gray-200 border-2 rounded-md"
                            key={idx}
                        >
                            {
                                //@ts-ignore
                                msg.input
                            }
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
