import express, { Request, Response } from 'express';
import next from 'next';
import http from 'http';
import socketIo from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
  const server = express();

  const httpServer = http.createServer(server);

  const io = new socketIo.Server(httpServer);

  io.on('connection', (socket) => {
    console.log('A user connected')

    socket.on('message', (msg) => {
      console.log('Message from client:', msg);
    })

    socket.on('disconnect', () => {
      console.log('A user disconnected')
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
