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
  const [groupMember, setGroupMember] = useState([])
  const [isProfileEdit, setIsProfileEdit] = useState(false)
  const [userImage, setUserImage] = useState(null);
  const [groupName, setGroupName] = useState('')

  return (
    <div className="h-[100vh]">
      <Toaster />
      {!isLogin?
        <Login 
            setUserName={setUserName} 
            userName={userName} 
            socket={socket} 
            setIsLogin={setIsLogin} 
            userMail={userMail} 
            setUserMail={setUserMail} 
            userInfo={userInfo} 
            setFriendInfo={setFriendInfo} 
            setMessages={setMessages}
            setUserImage={setUserImage}/>:
        <div className="w-full flex flex-row h-[100vh]">
          <div className="w-[5%]">
            <Option 
              userInfo={userInfo} 
              setIsLogin={setIsLogin} 
              swithTo={swithTo} 
              setSwitchTo={setSwitchTo} 
              setReceiver={setReceiver}
              setIsProfileEdit={setIsProfileEdit}
              userImage={userImage}
              setGroupName={setGroupName}
            />
          </div>
          <div className="w-[25%] pb-4 justify-center items-center flex-col">
            <Sidebar 
              groupName={groupName}
              setGroupName={setGroupName}
              userName={userName} 
              userInfo={userInfo} 
              setReceiver={setReceiver} 
              receiver={receiver} 
              friendInfo={friendInfo} 
              setFriendInfo={setFriendInfo} 
              swithTo={swithTo} 
              messages={messages}
              groupMember={groupMember} 
              setGroupMember={setGroupMember}
              socket={socket}
              setSwitchTo={setSwitchTo}
              isProfileEdit={isProfileEdit} 
              setIsProfileEdit={setIsProfileEdit}
              setUserImage={setUserImage}
              setMessages={setMessages}
              />
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
              groupMember={groupMember} 
              setFriendInfo={setFriendInfo}
              setReceiver={setReceiver}
            />
          </div>
        </div>
      }
    </div>
  );
}
