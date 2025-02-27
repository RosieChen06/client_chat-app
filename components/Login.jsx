'use client'
import React, { useState } from 'react'
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = ({userName, setUserName,room, setRoom, setIsLogin, socket, setLog}) => {


    const loginToChat = () => {
        if(userName!=='' && room !==''){
            const loginInfo = {user: userName, room: room, type:'join', dateTime: Date.now()}
            socket.emit('login', loginInfo)
            setLog((prev)=>[...prev, loginInfo])
            setIsLogin(true)
        }else{
            toast.warn("Please complete all the input field")
        }
    }

  return (
    <div className='w-full flex justify-center items-center h-[100vh] flex-col'>
        <p className='mb-12 font-extrabold text-green-500 text-[40px]'>Login</p>
        <div className='flex flex-col w-full max-w-[300px] gap-2 mb-8'>
            <input type='text' placeholder='Please input your name here' className='border-2 p-2 rounded-full w-full focus:outline-none' onChange={(e)=>setUserName(e.target.value)} value={userName}></input>
            <input type='text' placeholder='Room Code' className='border-2 p-2 rounded-full w-full focus:outline-none mb-4' onChange={(e)=>setRoom(e.target.value)} value={room}></input>
            <button className={`font-bold py-2 rounded-full ${(userName==='' || room==='')?'bg-gray-200 text-gray-600':'bg-green-500 text-white'}`} onClick={()=>loginToChat()}>Join Chat</button>
        </div>
    </div>
  )
}

export default Login