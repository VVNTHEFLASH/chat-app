import express, { Request, Response } from 'express';
import next from 'next';
import http from 'http';
import socketIo from 'socket.io';
import { ChatDataType, messagePayloadType } from 'chat-app/components/ChatScreen';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
  const server = express();

  const httpServer = http.createServer(server);

  const io = new socketIo.Server(httpServer);

  const rooms: Record<string, Set<{
    id: string;
    name: string;
  }>> = {};

  const messages: Record<string, { name: string; message: string }[]> = {}; // Room-specific message storage

  io.on('connection', (socket) => {
    console.log('A user connected', socket.id ?? "NA")
    // This will make sure to update the active rooms in initial state
    io.emit('activeRooms', Object.keys(rooms));

    socket.on('message', (payload: messagePayloadType) => {
      console.log(socket.id, 'Message from client:', payload);
      const { room, name } = payload.chatData;
      const { message } = payload;
      console.log(`${socket.id}_${name} sent a message to room ${room}: ${message}`);

      if (!messages[room]) {
        messages[room] = []
      }
      messages[room].push({ name, message });

      io.to(room).emit('message', messages[room])
    })

    socket.on('joinRoom', (data) => {
      if (!rooms[data.room]) {
        rooms[data.room] = new Set();
      }
      rooms[data.room].add({
        id: socket.id,
        name: data.name
      });
      socket.join(data.room);
      console.log(`User joined room: ${JSON.stringify(data, null, 2)}`)
      if (rooms[data.room]) {

        console.log(Object.keys(rooms), "Active Rooms")
        console.log(Array.from(rooms[data.room]), "Users in Room")
        io.emit('activeRooms', Object.keys(rooms));
        io.to(data.room).emit('usersInRoom', Array.from(rooms[data.room]));
      }
      if (messages[data.room]) {
        socket.emit('message', messages[data.room])
      }

    })

    socket.on('leaveRoom', ({ room, name }) => {
      if (rooms[room]) {
        rooms[room].delete(name);

        // If the room is empty, delete it
        if (rooms[room].size === 0) {
          delete rooms[room];
        }

        // Notify all clients about the updated room and user lists
        io.emit('activeRooms', Object.keys(rooms));
        if(rooms[room]) {
          io.to(room).emit('usersInRoom', Array.from(rooms[room]));
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);

      // Remove the user from all rooms
      for (const room of Object.keys(rooms)) {
        for (const user of rooms[room]) {
          console.log(user.id, "<==>", socket.id)
          if (user.id === socket.id) { // Use `socket.id` or custom logic for user tracking
            rooms[room].delete(user);
            break;
          }
        }

        // Clean up empty rooms
        if (rooms[room].size === 0) {
          delete rooms[room];
        }

        // Notify about updated rooms and users
        io.emit('activeRooms', Object.keys(rooms));
        if (rooms[room]) {
          io.to(room).emit('usersInRoom', Array.from(rooms[room]));
        }
      }
    });
  })

  // Example of a custom API route
  server.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from Express!' });
  });

  // Fallback to Next.js routing
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  httpServer.listen(PORT, (err?: Error) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
