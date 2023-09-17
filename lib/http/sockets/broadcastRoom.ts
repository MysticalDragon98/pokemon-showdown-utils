import { $io } from "./setupNotificationService";

export default function broadcastRoom (room: string, event: string, data: any) {
    $io.to(room).emit(event, data);
}