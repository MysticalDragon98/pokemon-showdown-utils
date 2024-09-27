import { Server } from "@mysticaldragon/unete";
import { $HTTP_PORT } from "../env";
import { Endpoints } from "./endpoints";
import setupNotificationService from './sockets/setupNotificationService';
//* Imports

export async function initHTTPServer () {
    const server = new Server({
        endpoints: Endpoints,
        port: $HTTP_PORT
    });

    setupNotificationService(server.httpServer.server)
    //* Plugins

    await server.listen();
}