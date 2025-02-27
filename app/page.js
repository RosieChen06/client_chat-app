'use client'

import ChatRoom from "@/components/ChatRoom";
import InputField from "@/components/InputField";
import Login from "@/components/Login";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

export default function Home() {

  const [isLogin, setIsLogin] = useState(false)
  const [userName, setUserName] = useState("")
  const [room, setRoom] = useState("")
  const [messages, setMessages] = useState([])
  const [log, setLog] = useState([])
  return (
    <div>
      {!isLogin?
        <Login setUserName={setUserName} userName={userName} setRoom={setRoom} room={room} socket={socket} setIsLogin={setIsLogin} setLog={setLog}/>:
        <div className="w-full flex h-[100vh]">
          <div className="w-1/4 pb-4 justify-center items-center flex-col">
            <Sidebar />
          </div>
          <div className="w-3/4 pb-4 justify-center items-center flex-col">
            <ChatRoom messages={messages} setMessages={setMessages} socket={socket} user={userName} log={log} setLog={setLog} room={room}/>
            <InputField socket={socket} user={userName} room={room} setMessages={setMessages}/>
          </div>
        </div>
      }
    </div>
  );
}
