import http from 'http';
import { Server as SocketIOServer } from 'socket.io'

const port = process.env.SOCKET_PORT ? parseInt(process.env.SOCKET_PORT) : 4000;
const server = http.createServer();



const io = new SocketIOServer(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let roomUsers: string[] = []
io.on('connection', (socket) => {
    let isShared: boolean = false 
    socket.on('join-room', (roomName) => {
        socket.join(roomName)
        roomUsers.push(socket.id)
       
        console.log(`Client joined room: ${roomName}`)
        const roomID = io.sockets.adapter.rooms.get(roomName);
        if (roomID) {
            const numberOfClients = roomID.size;
            console.log(`Number of clients in room ${roomName}: ${numberOfClients}`);
            if (numberOfClients > 1) {
                isShared = true
                console.log('Room size larger than 1. isShared set to true')
            }
        }
        console.log('room users: ', roomUsers)
});
    socket.on('leave-room', (roomName) => {
        socket.leave(roomName)
        console.log(`Client id: ${socket.id} left room ${roomName}`)
        //Slight delay to ensure leave operation completes
        process.nextTick(() => {
            const roomID = io.sockets.adapter.rooms.get(roomName);
            if (roomID) {
                const numberOfClients = roomID.size;
                console.log(`Number of clients in room ${roomName}: ${numberOfClients}`);
                if (numberOfClients <= 1) {
                    isShared = false
                    console.log('Room size equal to or smaller than 1. isShared set to false')
                }
            } else {
                console.log(`Room ${roomName} is now empty or does not exist.`);
            } 
            io.to(roomName).emit('user left', `A user has left the room: ${roomName}`);
        })
    })
    socket.on('chat-message', (data) => {
        const room = data.room
        const message = data.message
        // Broadcasting message to all connected clients in room
        if (room && message) {
            io.to(data.room).emit('chat-message', message);
                console.log('Received message:', message);
            }
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected')
    }); 
})

server.listen(port, () => console.log(`Socket.IO server running on port ${port}`))
