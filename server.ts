import http, { Server } from 'http';
import { Message } from 'postcss';
import { Server as SocketIOServer } from 'socket.io'

const port: number | "4000" | "3000" = process.env.SOCKET_PORT ? parseInt(process.env.SOCKET_PORT) : 4000;
const server: Server = http.createServer();

const io: SocketIOServer = new SocketIOServer(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});


let roomUsers: string[] = []
io.on('connection', (socket) => {
    let isShared: boolean = false 
    socket.on('create-user', (socket, usernameData) => {
        socket.username = usernameData
        console.log()
    });
    socket.on('join-room', (roomName) => {
        socket.join(roomName)
        roomUsers.push(socket.id)
        console.log(`Client joined room: ${roomName}`)
        const roomID: Set<string> | undefined = io.sockets.adapter.rooms.get(roomName);
        if (roomID) {
            const numberOfClients: number = roomID.size;
            console.log(`Number of clients in room ${roomName}: ${numberOfClients}`);
            if (numberOfClients > 1) {
                isShared = true
                console.log('Room size larger than 1. isShared set to true')
            }
        }
        console.log('room users: ', roomUsers)
});
    socket.on('leave-room', (roomName: string) => {
        socket.leave(roomName)
        const index: number = roomUsers.indexOf(socket.id)
            roomUsers.splice(index, 1)
        console.log(`Client id: ${socket.id} left room ${roomName}`)
        //Slight delay to ensure leave operation completes
        process.nextTick(() => {
            const roomID: Set<string> | string | undefined = io.sockets.adapter.rooms.get(roomName);
            if (roomID) {
                const numberOfClients = roomID.size;
                console.log(`Number of clients in room ${roomName}: ${numberOfClients}`);
                console.log('room users: ', roomUsers)
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
    socket.on('chat-message', (data: Message) => {
        // Broadcasting message to all connected clients in room
        if (data.room && data.message) {
            io.to(data.room).emit('chat-message', data);
            console.log('From: ', data.username)
            console.log('Received message:', data.message)
            }
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected')
    }); 
})

server.listen(port, () => console.log(`Socket.IO server running on port ${port}`))
