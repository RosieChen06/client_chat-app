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
  const [receiver, setReceiver] = useState({
    name: '',
    mail:'',
    image: ''
  })
  const userInfo = useRef(null)
  const [friendInfo, setFriendInfo] = useState([])

  return (
    <div>
      <Toaster />
      {!isLogin?
        <Login setUserName={setUserName} userName={userName} socket={socket} setIsLogin={setIsLogin} userMail={userMail} setUserMail={setUserMail} userInfo={userInfo} setFriendInfo={setFriendInfo} setMessages={setMessages}/>:
        <div className="w-full flex flex-row h-[100vh]">
          <div className="w-1/4 pb-4 justify-center items-center flex-col">
            <Sidebar userName={userName} userInfo={userInfo} setReceiver={setReceiver} receiver={receiver} friendInfo={friendInfo} setFriendInfo={setFriendInfo} />
          </div>
          <div className="w-3/4 flex flex-col h-[100vh]">
            <div className="flex-grow w-full">
              <ChatRoom
                messages={messages}
                setMessages={setMessages}
                socket={socket}
                user={userMail}
                receiver={receiver}
                userInfo={userInfo}
                friendInfo={friendInfo}
              />
            </div>
            <div className="h-fit w-full">
              <InputField
                socket={socket}
                setMessages={setMessages}
                receiver={receiver}
                userInfo={userInfo}
              />
            </div>
          </div>
        </div>
      }
    </div>
  );
}
