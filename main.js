import { WebSocketServer } from "ws";
import { getCurrentRoom, newPlayer } from "./RoomManager.js";

const wss = new WebSocketServer({ port: 8000 });

const isGameLost = (cells) => {
    let currentCol = 0;
    let currentRow = 0;
    let previousValue = null;
    if (cells) {
        for (let i = 0; i < cells.length; i++) {
            const column = cells[i];
            for (let j = 0; j < column.length; j++) {
                const cell = column[j];
                if (!cell) {
                    return false;
                }
                const value = cell.value;
                if ((previousValue != null && value == previousValue) || (cells[currentCol + 1] && cells[currentCol + 1][currentRow] && value == cells[currentCol + 1][currentRow].value) || (cells[currentCol - 1] && cells[currentCol - 1][currentRow] && value == cells[currentCol - 1][currentRow].value)) {
                    return false;
                }
                previousValue = value;
                currentRow++;
            }
            previousValue = null;
            currentRow = 0;
            currentCol++;
        }
        return true;
    }
    return false;
}

wss.on('connection', (ws, req) => {
    newPlayer(ws);
    console.log(req.socket.remoteAddress + " connected to room " + getCurrentRoom());
});