import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from 'uuid';

const wss = new WebSocketServer({ port: 8000 });
const clients = new Map();
const rooms = [];
let currentRoom = 0;
let currentRoomPlayers = 0;
const roomLimit = 16;

const getRoom = () => {
    if (currentRoomPlayers >= roomLimit) {
        currentRoom++;
        currentRoomPlayers = 1;
    } else {
        currentRoomPlayers++;
    }
    return currentRoom;
};
const broadcastNewState = (room, id, state) => {
    rooms[room].forEach(playerWs => {
        playerWs.send(JSON.stringify({
            "id": id,
            "state": state
        }));
    });
};

wss.on('connection', (ws, req) => {
    const clientId = uuidv4();
    const room = getRoom();

    console.log(req.socket.remoteAddress + " connected to room " + room);

    clients.set(ws, {
        id: clientId,
        room: room,
        state: {}
    });

    if (!rooms[room]) {
        rooms.push([]);
    }
    rooms[room].push(ws);

    broadcastNewState(currentRoom, clientId, {});

    ws.on('message', (stateAsString) => {
        const sender = clients.get(ws);
        sender.state = JSON.parse(stateAsString);
        broadcastNewState(sender.room, sender.id, sender.state);
    });
});