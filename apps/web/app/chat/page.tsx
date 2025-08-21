"use client"
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
        <div>
            <input
                placeholder="message:"
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>

            <div>
                {messages.map((msg, idx) => (
                    <div key={idx}>{msg.input}</div>
                ))}
            </div>
        </div>
    )
}
