'use client'

import ChatRoom from "@/components/ChatRoom";
import InputField from "@/components/InputField";
import Login from "@/components/Login";
import Sidebar from "@/components/Sidebar";
import Option from "@/components/Option";
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
  const [swithTo, setSwitchTo] = useState('Messages')

  return (
    <div className="h-[100vh] overflow-hidden">
      <Toaster />
      {!isLogin?
        <Login setUserName={setUserName} userName={userName} socket={socket} setIsLogin={setIsLogin} userMail={userMail} setUserMail={setUserMail} userInfo={userInfo} setFriendInfo={setFriendInfo} setMessages={setMessages}/>:
        <div className="w-full flex flex-row h-[100vh]">
          <div className="w-[5%]">
            <Option userInfo={userInfo} setIsLogin={setIsLogin} swithTo={swithTo} setSwitchTo={setSwitchTo}/>
          </div>
          <div className="w-[25%] pb-4 justify-center items-center flex-col">
            <Sidebar userName={userName} userInfo={userInfo} setReceiver={setReceiver} receiver={receiver} friendInfo={friendInfo} setFriendInfo={setFriendInfo} swithTo={swithTo} messages={messages}/>
          </div>
          <div className="w-[70%] flex flex-col h-[100vh]">
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
          {/* <div className="h-fit w-full">
            <InputField
              socket={socket}
              setMessages={setMessages}
              receiver={receiver}
              userInfo={userInfo}
            />
          </div> */}
        </div>
      }
    </div>
  );
}
