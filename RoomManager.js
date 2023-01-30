import RequestManager from "./RequestManager.js";
import { v4 as uuidv4 } from 'uuid';
import ResponseManager from "./ResponseManager.js";

const timeLimit = 10;
const playersLimit = 9;

const rooms = [];
let currentRoomTimeout = null;

const startCurrentRoomGame = () => {
    if (currentRoomTimeout) {
        clearTimeout(currentRoomTimeout);
    }

    for (let [ws, metadata] of rooms[rooms.length - 1].players) {
        ws.on('message', (data) => {
            RequestManager(JSON.parse(data));
        });
        ResponseManager('roomStatus', ws, { players: rooms[rooms.length - 1].players });
    }
};

const createRoom = () => {
    rooms.push({
        players: new Map(),
        timeUntilGameStart: timeLimit
    });
    currentRoomTimeout = setTimeout(() => {
        if (rooms[rooms.length - 1].players.size > 0) {
            startCurrentRoomGame();
            createRoom();
        }
    }, timeLimit * 1000);
};

export const newPlayer = (ws) => {
    if (rooms.length == 0) {
        createRoom();
    }

    let currentRoom = rooms[rooms.length - 1];

    if (currentRoom.players.size >= playersLimit) {
        startCurrentRoomGame();
        createRoom();
    }

    currentRoom = rooms[rooms.length - 1];

    currentRoom.players.set(ws, {
        id: uuidv4(),
        lost: false,
        state: {}
    });

    const timeLeft = currentRoom.players.size < 9 ? Math.ceil((currentRoomTimeout._idleStart / 1000) + (currentRoomTimeout._idleTimeout / 1000) - process.uptime()) : false;
    ResponseManager('timeout', ws, { type: 'timeout', time: timeLeft });

    return currentRoom;
}

export const getCurrentRoom = () => rooms.length - 1;