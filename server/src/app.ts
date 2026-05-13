import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io'
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
    }
});

io.on('connection', (socket) => {
    console.log('User connected: ', socket.id);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);

        socket.to(roomId).emit('user-joined');
    });

    socket.on('offer', (offer) => {
        socket.to('room-1').emit('offer', offer);
    });

    socket.on('answer', (answer) => {
        socket.to('room-1').emit('answer', answer);
    });

    socket.on('ice-candidate', (candidate) => {
        socket.to('room-1').emit('ice-candidate', candidate);
    });

    socket.on('leave-room', (roomId) => {
        console.log('User left room: ', roomId);
        socket.to(roomId).emit('user-left');
        socket.leave(roomId);
    })

    socket.on('disconnect', () => {
        socket.to("room-1").emit("user-left");
        console.log('User disconnected: ', socket.id);
    });
});

server.listen(process.env.PORT, () => console.log('Server running on port 5000'));