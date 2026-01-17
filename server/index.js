const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

const PORT = process.env.PORT || 5000;

// Store room data (participants, whiteboard state, etc.)
const rooms = {};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', ({ roomID, userID }) => {
        socket.join(roomID);
        console.log(`User ${userID} joined room ${roomID}`);

        if (!rooms[roomID]) {
            rooms[roomID] = {
                participants: [],
                whiteboard: [],
            };
        }

        // Notify others in the room
        socket.to(roomID).emit('user-joined', { userID });

        // Add to participants list
        rooms[roomID].participants.push({ userID, socketId: socket.id });

        // Send existing whiteboard data to the new user
        socket.emit('init-whiteboard', { paths: rooms[roomID].whiteboard });
    });

    socket.on('signal', ({ to, signal }) => {
        // Find the socket ID for the target userID
        // In a production app, you'd map userID to socketID globally
        io.emit('signal', { from: socket.id, signal });
        // Simplified for now: broadcast signal (clients will filter by ID)
        // For per-user signal: socket.to(targetSocketId).emit('signal', ...)
    });

    socket.on('draw', ({ roomID, path }) => {
        if (rooms[roomID]) {
            rooms[roomID].whiteboard.push(path);
        }
        socket.to(roomID).emit('draw', { path });
    });

    socket.on('disconnecting', () => {
        socket.rooms.forEach(roomID => {
            if (rooms[roomID]) {
                rooms[roomID].participants = rooms[roomID].participants.filter(p => p.socketId !== socket.id);
                socket.to(roomID).emit('user-disconnected', { socketId: socket.id });
            }
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Signaling server running on port ${PORT}`);
});
