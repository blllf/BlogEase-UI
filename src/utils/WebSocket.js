export const connectWS = (param) => {
    const socket = new WebSocket(`ws://localhost:8081/ws?userId=${param}`);
    socket.onopen = function() {
        console.log('Connected to WebSocket');
        //socket.send('1');
    };
    socket.onmessage = function(event) {
        console.log('默认Received message: ' + event.data);
        //alert("操作成功" + event.data)
    };
    socket.onclose = function() {
        console.log('Disconnected from WebSocket');
    };
    return socket;
};

export const disconnect = (socket) => {
    if (socket) {
        socket.close();
    }
};