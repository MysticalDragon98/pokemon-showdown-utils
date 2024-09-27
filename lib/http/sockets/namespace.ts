import broadcastNamespace from "./broadcastNamespace";
import { $io } from "./setupNotificationService";

export default class Namespace {
    name: string;

    constructor (name: string) {
        this.name = name;
    }

    broadcast (event: string, data: any) {
        broadcastNamespace(this.name, event, data);
    }

    async on (event: string, callback: (socket: any, data: any) => void) {
        while (!$io) await new Promise(resolve => setTimeout(resolve, 100));
        
        $io.of(this.name).on(event, callback);
    }
}