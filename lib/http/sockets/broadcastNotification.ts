import { $io } from "./setupNotificationService";

export default function broadcastNotification (name: string, data: any) {
    $io.emit(name, data);
}