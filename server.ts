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

  let localDb: {
    rooms: {
      name: string;
      users: string;
    }[]
  } = {
    rooms: []
  }

  const messages: Record<string, { name: string; message: string }[]> = {}; // Room-specific message storage


  io.on('connection', (socket) => {
    console.log('A user connected', socket.id ?? "NA")

    socket.on('message', (payload: messagePayloadType) => {
      console.log(socket.id, 'Message from client:', payload);
      const { room, name } = payload.chatData;
      const { message } = payload;
      console.log(`${name} sent a message to room ${room}: ${message}`);

      if (!messages[room]) {
        messages[room] = []
      }
      messages[room].push({ name, message });

      io.to(room).emit('message', messages[room])
    })

    socket.on('joinRoom', ({ room }) => {
      socket.join(room);
      console.log(`User joined room: ${room}`)
      if (messages[room]) {
        socket.emit('message', messages[room])
      }
    })

    socket.on('disconnect', () => {
      console.log('A user disconnected', socket.id)
    })
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
