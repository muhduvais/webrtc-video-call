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

server.listen(process.env.PORT, () => console.log('Server running on port 5000'));