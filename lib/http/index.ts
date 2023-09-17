import { Server } from "@mysticaldragon/unete";
import { $HTTP_PORT } from "../env";
import { Endpoints } from "./endpoints";


export async function initHTTPServer () {
    const server = new Server({
        endpoints: Endpoints,
        port: $HTTP_PORT,
        ssl: {
            "cert": "/Users/camilotd/certs/ps-assistant.pem",
            "key": "/Users/camilotd/certs/ps-assistant-key.pem",
            "ca": "/Users/camilotd/certs/ps-assistant.pem"
        }
    });

    await server.listen();
}