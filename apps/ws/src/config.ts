import WebSocket from "ws"
export const JWT_SECRET = "SUPERDuperSEcret"

export type UserConnection = {
    userId: number
    ws: WebSocket
}
