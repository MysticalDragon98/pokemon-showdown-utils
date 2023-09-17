import { $io } from "./setupNotificationService";

export default function broadcastNamespace (namespace: string, event: string, data: any) {
    $io.of(namespace).emit(event, data);
}