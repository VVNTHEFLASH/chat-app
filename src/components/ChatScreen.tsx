"use client";

import React, { useEffect, useRef, useState } from 'react'
import { DefaultEventsMap } from 'socket.io';
import { io, Socket } from 'socket.io-client';

export interface ChatDataType {
    name: string;
    room: string;
}

export interface messagePayloadType {
    message: string;
    chatData: ChatDataType;
}

const initialChatData: ChatDataType = {
    name: '',
    room: ''
}

export default function ChatScreen() {
    const socketRef = useRef<Socket | null>(null); // Persist socket instance

    const [isJoined, setIsJoined] = useState(false)
    const [chatData, setChatData] = useState<ChatDataType>(initialChatData);
    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState<{
        name: string; message: string
    }[]>([])

    const [activeRooms, setActiveRooms] = useState<string[]>([]);
    const [usersInRoom, setUsersInRoom] = useState<{
        id: string;
        name: string;
    }[]>([]);


    function handleChatDataChange(key: string, value: string) {
        setChatData((prev) => {
            return { ...prev, [key]: value };
        });
    }

    function handleMessageChange({ value }: { value: string }) {
        console.log(value, "Typing...")
        setMessage(value)
    }

    function pressJoin() {
        console.log(chatData, "Chat data")
        if (!chatData) {
            return
        }
        if (!chatData.name.trim() || !chatData.room.trim()) {
            return alert("Please enter your name and chat room name")
        }
        setIsJoined(true)
        // Emit joinRoom event to the server
        if (socketRef.current) {
            socketRef.current.emit("joinRoom", { room: chatData.room, name: chatData.name });
        }
    }

    function pressReset() {
        handleLeaveRoom()
        setChatData(initialChatData)
        setIsJoined(false)
        setMessage('')
    }

    const handleLeaveRoom = () => {
        if (socketRef.current) {
            const { room, name } = chatData;
            if (room && name) {
                socketRef.current.emit('leaveRoom', { room, name });
                setUsersInRoom([]);
            }
        }
        window.location.reload()
    };

    function pressSend() {
        if (!message.trim()) {
            return 
        }
        if (!chatData.name.trim() || !chatData.room.trim()) {
            return alert("Please enter your name and chat room name")
        }

        if (socketRef.current) {
            console.log('Sending the message...')
            const messagePayload = {
                message,
                chatData
            }
            socketRef.current.emit('message', messagePayload);
            console.log('Message is sent', messagePayload)
            setMessage('')
        }
    }

    useEffect(() => {
        const socket = io();
        socketRef.current = socket;

        // Listen for updates on active rooms
        socket.on('activeRooms', (rooms: string[]) => {
            console.log('Active rooms:', rooms);
            setActiveRooms(rooms);
        });

        // Listen for updates on users in the current room
        socket.on('usersInRoom', (users: {
            id: string;
            name: string;
        }[]) => {
            console.log('Users in room:', users);
            setUsersInRoom(users);
        });


        socket.on('message', (roomMessages: { name: string; message: string }[]) => {
            console.log("Message from server: ", roomMessages);
            setMessages(roomMessages)
        })

        return () => {
            socket.off('message');
        }
    }, [])

    return (
        <div className='flex flex-col justify-between h-screen'>
            <header className='m-5'>
                <input
                    onChange={({ target }) => handleChatDataChange('name', target.value)}
                    type="text" value={chatData?.name ?? ""}
                    placeholder='Your name' className='text-black bg-white px-3 mx-2 rounded-md' />
                <input onChange={({ target }) => handleChatDataChange('room', target.value)}
                    type="text" value={chatData?.room ?? ""}
                    placeholder='Chat room' className='text-black bg-white px-3 mx-2 rounded-md' />
                <button onClick={pressJoin}
                    type='button' className='bg-green-400 px-3 mx-2 rounded-md'>Join</button>
                <button onClick={pressReset}
                    type='button' className='bg-red-500 px-3 mx-2 rounded-md'>Reset</button>
                {/* main body */}
                <main className='my-5 p-1.5 bg-gray-700 rounded-md min-h-full'>
                    <h1 className='bg-white rounded-md pl-5 my-2 text-black'>Welcome to the Chat app!</h1>
                    {messages.map((item, index) => {
                        return item.name.toLowerCase() === 'admin' ? (
                            <div key={item.name + index}>
                                <h1 className='bg-white rounded-md px-5 my-2 text-black'>{item.message}</h1>
                            </div>
                        ) : (
                            <div key={item.name + index} className='flex flex-col'>
                                <span>{item.name}</span>
                                <h1 className='bg-white rounded-md px-5 my-2 text-black'>{item.message}</h1>
                            </div>
                        )
                    })}
                </main>
            </header>
            <footer className='m-5'>
                <div className='flex flex-col my-2.5'>
                    <div>
                        <h2>Active Rooms</h2>
                        <ul>
                            {activeRooms.map((room, index) => (
                                <li key={index}>{room}</li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2>Users in Room</h2>
                        <ul>
                            {usersInRoom.map((user) => (
                                <li key={user.id}>{user.name}</li>
                            ))}
                        </ul>
                    </div>
                </div>
                <input onChange={({ target }) => handleMessageChange(target)}
                    type="text" value={message}
                    placeholder='Your message' className='text-black bg-white px-3 mx-2 rounded-md' />
                <button onClick={pressSend} disabled={!message}
                    type='button' className='bg-blue-400 px-3 mx-2 rounded-md'>Send</button>
            </footer>
        </div>
    )
}
