"use client";

import React, { useEffect, useState } from 'react'

interface ChatDataType {
    name: string;
    room: string;
}

const initialChatData: ChatDataType = {
    name: '',
    room: ''
}

export default function ChatScreen() {

    const [isJoined, setIsJoined] = useState(false)
    const [chatData, setChatData] = useState<ChatDataType>(initialChatData);
    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState<string[]>([])
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
            return
        }
        setIsJoined(true)
    }

    function pressReset() {
        setChatData(initialChatData)
        setIsJoined(false)
        setMessage('')
    }

    function pressSend() {
        if(!message.trim()) {
            return
        }
        setMessages((prev) => {
            return [...prev, message]
        })
    }

    return (
        <div className='flex flex-col justify-between h-screen'>
            <header className='m-5'>
                <input onChange={({ target }) => handleChatDataChange('name', target.value)}
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
                        return (
                            <div key={item+index}>
                                <h1 className='bg-white rounded-md pl-5 my-2 text-black'>{item}</h1>
                            </div>
                        )
                    })}
                </main>
            </header>
            {isJoined && <footer className='m-5'>
                <div className='flex flex-col my-2.5'>
                    <span className='my-2.5'>Users in {"current room users"}: Admin, User</span>
                    <span className='my-2.5'>Active rooms {"current room"}: Admin, User</span>
                </div>
                <input onChange={({ target }) => handleMessageChange(target)}
                    type="text" value={message}
                    placeholder='Your message' className='text-black bg-white px-3 mx-2 rounded-md' />
                <button onClick={pressSend}
                type='button' className='bg-blue-400 px-3 mx-2 rounded-md'>Send</button>
            </footer>}
        </div>
    )
}
