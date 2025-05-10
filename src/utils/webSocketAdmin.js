
import { connectWS } from './WebSocket.js';

let socket;

export const initWebSocket = (userId) => {
    socket = connectWS(userId);
    return socket;
};

export const send = (message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        //socket.send("yes !!!");
        socket.send(message);
    } else {
        console.log('WebSocket is not open. ReadyState:', socket.readyState);
    }
};

export const setOnMessageHandler = (handler) => {
    if (socket) {
        socket.onmessage = handler;
    } else {
        console.log('WebSocket is not initialized yet.');
    }
};

export const disconnect = (socket) => {
    if (socket) {
        socket.close();
        //console.log('WebSocket connection closed.');
    }
};