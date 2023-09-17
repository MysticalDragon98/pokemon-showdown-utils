import { Socket } from "socket.io";

export default function joinRoom (socket: Socket, room: string) {
    socket.join(room);
}