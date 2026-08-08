"use client";

import { formatTime } from 'chat-app/utils/helper';
import React, { useEffect, useRef, useState } from 'react'
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

    const [chatData, setChatData] = useState<ChatDataType>(initialChatData);
    const [typingStatus, setTypingStatus] = useState('');

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
        if (value) {
            socketRef.current?.emit('typing', { room: chatData.room, name: chatData.name })
        }
        else {
            socketRef.current?.emit('stopTyping', { room: chatData.room })
        }
    }

    function pressJoin() {
        console.log(chatData, "Chat data")
        if (!chatData) {
            return
        }
        if (!chatData.name.trim() || !chatData.room.trim()) {
            return alert("Please enter your name and chat room name")
        }
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
                socketRef.current.emit('stopTyping', { room })

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
            socketRef.current.emit('stopTyping', { room: chatData.room })
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

        socket.on('userTyping', (statusMessage) => {
            setTypingStatus(statusMessage);
        });

        return () => {
            socket.off('message');
            socket.off('userTyping');
        }
    }, [])

    return (
        <div className="flex flex-col h-[100dvh] min-h-0 items-center overflow-hidden">
            <header className="w-full px-3 pt-3 pb-2 md:w-1/2">
                {/* Header: Inputs and Buttons */}
                <div className="flex flex-wrap gap-2 items-center">
                    <input
                        onChange={({ target }) => handleChatDataChange('name', target.value)}
                        type="text"
                        value={name}
                        placeholder="Your name"
                        className="text-black bg-white px-3 py-2 rounded-md flex-1 min-w-0"
                    />
                    <input
                        onChange={({ target }) => handleChatDataChange('room', target.value)}
                        type="text"
                        value={room}
                        placeholder="Chat room"
                        className="text-black bg-white px-3 py-2 rounded-md flex-1 min-w-0"
                    />
                    <button
                        onClick={pressJoin}
                        type="button"
                        className="bg-green-400 px-3 py-2 rounded-md shrink-0"
                    >
                        Join
                    </button>
                    <button
                        onClick={pressReset}
                        type="button"
                        className="bg-red-500 px-3 py-2 rounded-md shrink-0"
                    >
                        Reset
                    </button>
                </div>
            </header>

            <main className="flex-1 min-h-0 p-1.5 bg-gray-700 rounded-md overflow-y-auto w-full px-3 md:w-1/2 my-2">
                <h1 className="bg-white rounded-md px-5 py-1 my-2 text-black break-words">
                    Welcome to the Chat app!!!
                </h1>

                {/* Display Messages */}
                {messages.map((item, index) => {
                    return item.id.toLocaleLowerCase() === 'system' ?
                        item.name === chatData.name ? (
                            <div key={item.name + index}>
                                <h1 className="bg-white rounded-md px-5 py-1 my-2 text-black break-words">{
                                    `You have joined the ${chatData.room}.`}</h1>
                            </div>
                        ) : (
                            <div key={item.name + index}>
                                <h1 className="bg-white rounded-md px-5 py-1 my-2 text-black break-words">{item.message}</h1>
                            </div>
                        )
                        : item.name === chatData.name ? (
                            <div key={item.name + index} className="flex my-2 justify-end">
                                <div className="flex flex-col max-w-[75%] rounded-md overflow-hidden">
                                    <span className="px-3 bg-green-600 flex flex-row justify-between gap-2 flex-wrap">
                                        <p className="truncate max-w-[120px] sm:max-w-none">{item.name}</p>
                                        <p className="shrink-0">{formatTime(item.time)}</p>
                                    </span>
                                    <h1 className="bg-white px-3 py-1 text-black break-words">{item.message}</h1>
                                </div>
                            </div>
                        ) : (
                            <div key={item.name + index} className="flex flex-col my-2 rounded-md overflow-hidden max-w-[75%]">
                                <span className="px-3 bg-blue-600 flex flex-row justify-between gap-2 flex-wrap">
                                    <p className="truncate max-w-[120px] sm:max-w-none">{item.name}</p>
                                    <p className="shrink-0">{formatTime(item.time)}</p>
                                </span>
                                <h1 className="bg-white px-3 py-1 text-black break-words">{item.message}</h1>
                            </div>
                        );
                })}
            </main>

            <footer className="w-full px-3 pb-3 pt-1 md:w-1/2">
                <div className="flex flex-col mb-2">
                    <div className="flex flex-row gap-2 flex-wrap">
                        <h2 className="shrink-0">Active Rooms:</h2>
                        <p className="break-all">{activeRooms.map((room) => room).join(', ')}</p>
                    </div>

                    <div className="flex flex-row gap-2 flex-wrap">
                        <h2 className="shrink-0">Users in Room</h2>
                        <p className="break-all">{usersInRoom.map((user) => user.name).join(', ')}</p>
                    </div>
                </div>

                {/* Message Input & Send Button */}
                {typingStatus && <p className='mb-2 text-sm'>{typingStatus}</p>}
                <div className="flex flex-row w-full gap-2">
                    <input
                        onChange={({ target }) => handleMessageChange(target)}
                        type="text"
                        value={message}
                        placeholder="Your message"
                        className="text-black bg-white px-3 py-2 rounded-md flex-1 min-w-0"
                    />
                    <button
                        onClick={pressSend}
                        disabled={!message}
                        type="button"
                        className="bg-blue-400 px-3 py-2 rounded-md shrink-0"
                    >
                        Send
                    </button>
                </div>
            </footer>
        </div>
    )
}
