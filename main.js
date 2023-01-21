import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from 'uuid';

const wss = new WebSocketServer({ port: 8000 });
const clients = new Map();
const rooms = [];
let currentRoom = 0;
const roomLimit = 9;

const getRoom = () => {
    const currentRoomPlayers = rooms[currentRoom] ? rooms[currentRoom].length : 0;
    if (currentRoomPlayers >= roomLimit) {
        if (currentRoom >= 999999999999999) {
            currentRoom = -1;
        }
        currentRoom++;
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

    // ws.on('close', () => {
    //     rooms[clients.get(ws).room] = rooms[clients.get(ws).room].filter(i => clients.get(i).id != clients.get(ws).id);
    // });
});