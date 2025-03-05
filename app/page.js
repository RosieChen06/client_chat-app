'use client'

import ChatRoom from "@/components/ChatRoom";
import InputField from "@/components/InputField";
import Login from "@/components/Login";
import Sidebar from "@/components/Sidebar";
import { useRef, useState } from "react";
import { io } from "socket.io-client";
import { Toaster } from 'react-hot-toast';

const socket = io("http://localhost:3001");

export default function Home() {

  const [isLogin, setIsLogin] = useState(false)
  const [userName, setUserName] = useState("")
  const [userMail, setUserMail] = useState("")
  const [messages, setMessages] = useState([])
  const [receiver, setReceiver] = useState("")
  const userInfo = useRef(null)

  return (
    <div>
      <Toaster />
      {!isLogin?
        <Login setUserName={setUserName} userName={userName} socket={socket} setIsLogin={setIsLogin} userMail={userMail} setUserMail={setUserMail} userInfo={userInfo}/>:
        <div className="w-full flex h-[100vh]">
          <div className="w-1/4 pb-4 justify-center items-center flex-col">
            <Sidebar userName={userName} userInfo={userInfo} setReceiver={setReceiver} receiver={receiver}/>
          </div>
          <div className="w-3/4 pb-4 justify-center items-center flex-col">
            <ChatRoom messages={messages} setMessages={setMessages} socket={socket} user={userName} receiver={receiver}/>
            <InputField socket={socket} setMessages={setMessages} receiver={receiver} userInfo={userInfo}/>
          </div>
        </div>
      }
    </div>
  );
}
