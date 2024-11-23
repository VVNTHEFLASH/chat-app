"use client"
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketExample = () => {
  const [socket, setSocket] = useState<any>(null);
  const [message, setMessage] = useState<string>('');
  const [serverMessage, setServerMessage] = useState<string>('');

  useEffect(() => {
    // Connect to the server
    const socket = io();

    setSocket(socket);

    // Listen for messages from the server
    socket.on('message', (msg: string) => {
      console.log('Message from server:', msg);
      setServerMessage(msg);
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (socket) {
      socket.emit('message', message); // Emit the message to the server
    }
  };

  return (
    <div>
      <h1>Socket.IO with Next.js</h1>
      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter message"
        />
        <button onClick={sendMessage}>Send Message</button>
      </div>
      <div>
        <h2>Server Message:</h2>
        <p>{serverMessage}</p>
      </div>
    </div>
  );
};

export default SocketExample;
