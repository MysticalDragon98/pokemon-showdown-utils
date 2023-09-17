import { Express } from 'express';
import { Server } from 'socket.io';
import { log } from "termx";

export let $io: Server;

export default function setupNotificationService (httpServer: Express) {
    $io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    log("Notifications service attached to http server");
}