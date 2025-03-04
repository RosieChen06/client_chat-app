'use client'

import ChatRoom from "@/components/ChatRoom";
import InputField from "@/components/InputField";
import Login from "@/components/Login";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import { io } from "socket.io-client";
import { Toaster } from 'react-hot-toast';

const socket = io("http://localhost:3001");

export default function Home() {

  const [isLogin, setIsLogin] = useState(false)
  const [userName, setUserName] = useState("")
  const [userMail, setUserMail] = useState("")
  const [room, setRoom] = useState("")
  const [messages, setMessages] = useState([])
  const [log, setLog] = useState([])
  const [picture, setPicture] = useState('')

  return (
    <div>
      <Toaster />
      {!isLogin?
        <Login setUserName={setUserName} userName={userName} setRoom={setRoom} room={room} socket={socket} setIsLogin={setIsLogin} setLog={setLog} userMail={userMail} setUserMail={setUserMail} setPicture={setPicture}/>:
        <div className="w-full flex h-[100vh]">
          <div className="w-1/4 pb-4 justify-center items-center flex-col">
            <Sidebar picture={picture} userName={userName}/>
          </div>
          <div className="w-3/4 pb-4 justify-center items-center flex-col">
            <ChatRoom messages={messages} setMessages={setMessages} socket={socket} user={userName} log={log} setLog={setLog} room={room} picture={picture}/>
            <InputField socket={socket} user={userName} room={room} setMessages={setMessages}/>
          </div>
        </div>
      }
    </div>
  );
}
