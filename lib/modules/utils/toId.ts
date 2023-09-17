export default function toId (id: string) {
    return id.toLowerCase().replace(/[^a-z0-9]+/g, '');
}
