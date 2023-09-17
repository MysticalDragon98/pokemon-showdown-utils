import { $HOST } from "../../env";

export default function getReplayHtmlUrl (id: string) {
    return `${$HOST}/battles/replay?id=${id}`
}
