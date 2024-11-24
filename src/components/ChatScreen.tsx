"use client";

import { formatTime } from 'chat-app/utils/helper';
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

    const [message, setMessage] = useState("");
    const [name, setName] = useState('')
    const [room, setRoom] = useState('')
    const [messages, setMessages] = useState<{
        name: string; message: string, time: string, id: string
    }[]>([])

    const [activeRooms, setActiveRooms] = useState<string[]>([]);
    const [usersInRoom, setUsersInRoom] = useState<{
        id: string;
        name: string;
    }[]>([]);


    function handleChatDataChange(key: string, value: string) {
        if (key === 'name') setName(value);
        if (key === 'room') setRoom(value);
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
        setName('');
        setRoom('');
    }

    function pressReset() {
        handleLeaveRoom()
        setChatData(initialChatData)
        setIsJoined(false)
        setMessage('')
        setName('');
        setRoom('');
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


        socket.on('message', (roomMessages: { name: string; message: string, id: string, time: string }[]) => {
            console.log("Message from server: ", roomMessages);
            setMessages(roomMessages)
        })

        socket.on("alert", (data: { message: string }) => {
            alert(data.message)
        })

        return () => {
            socket.off('message');
        }
    }, [])

    return (
        <div className="flex flex-col justify-between h-screen items-center">
            <header className="m-5 w-1/2">
                {/* Header: Inputs and Buttons */}
                <div className="flex flex-row gap-2 items-center mb-4">
                    <input
                        onChange={({ target }) => handleChatDataChange('name', target.value)}
                        type="text"
                        value={name}
                        placeholder="Your name"
                        className="text-black bg-white px-3 py-2 rounded-md w-full sm:w-auto"
                    />
                    <input
                        onChange={({ target }) => handleChatDataChange('room', target.value)}
                        type="text"
                        value={room}
                        placeholder="Chat room"
                        className="text-black bg-white px-3 py-2 rounded-md w-full sm:w-auto"
                    />
                    <button
                        onClick={pressJoin}
                        type="button"
                        className="bg-green-400 px-3 py-2 rounded-md"
                    >
                        Join
                    </button>
                    <button
                        onClick={pressReset}
                        type="button"
                        className="bg-red-500 px-3 py-2 rounded-md"
                    >
                        Reset
                    </button>
                </div>
            </header>

            <main className="my-5 p-1.5 bg-gray-700 rounded-md min-h-[75vh] max-h-[75vh] overflow-y-auto w-1/2">
                <h1 className="bg-white rounded-md px-5 py-1 my-2 text-black">
                    Welcome to the Chat app!!!
                </h1>

                {/* Display Messages */}
                {messages.map((item, index) => {
                    return item.id.toLocaleLowerCase() === 'system' ? (
                        <div key={item.name + index}>
                            <h1 className="bg-white rounded-md px-5 py-1 my-2 text-black">{item.message}</h1>
                        </div>
                    ) : item.name === chatData.name ? (
                        <div key={item.name + index} className="flex my-2 justify-end">
                            <div className="flex flex-col w-1/2 item-end rounded-md overflow-hidden">
                                <span className="px-5 bg-green-600 flex flex-row justify-between">
                                    <p>{item.name}</p>
                                    <p>{formatTime(item.time)}</p>
                                </span>
                                <h1 className="bg-white px-5 py-1 text-black">{item.message}</h1>
                            </div>
                        </div>
                    ) : (
                        <div key={item.name + index} className="flex flex-col my-2 rounded-md overflow-hidden w-1/2">
                            <span className="px-5 bg-blue-600 flex flex-row justify-between">
                                <p>{item.name}</p>
                                <p>{formatTime(item.time)}</p>
                            </span>
                            <h1 className="bg-white px-5 py-1 text-black">{item.message}</h1>
                        </div>
                    );
                })}
            </main>

            <footer className="m-5 w-1/2">
                <div className="flex flex-col my-2.5">
                    <div className="flex flex-row gap-2">
                        <h2>Active Rooms:</h2>
                        <p>{activeRooms.map((room) => room).join(', ')}</p>
                    </div>

                    <div className="flex flex-row gap-2">
                        <h2>Users in Room</h2>
                        <p>{usersInRoom.map((user) => user.name).join(', ')}</p>
                    </div>
                </div>

                {/* Message Input & Send Button */}
                <div className="flex flex-row w-full gap-2">
                    <input
                        onChange={({ target }) => handleMessageChange(target)}
                        type="text"
                        value={message}
                        placeholder="Your message"
                        className="text-black bg-white px-3 py-1 mx-2 rounded-md flex-grow"
                    />
                    <button
                        onClick={pressSend}
                        disabled={!message}
                        type="button"
                        className="bg-blue-400 px-3 py-1 mx-2 rounded-md w-auto"
                    >
                        Send
                    </button>
                </div>
            </footer>
        </div>
    )
}
