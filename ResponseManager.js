export default function ResponseManager(type, ws, data) {
    ws.send(JSON.stringify({ type: type, ...data }));
};