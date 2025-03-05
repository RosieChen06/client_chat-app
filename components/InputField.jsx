'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'

const InputField = ({socket, setMessages, receiver, userInfo}) => {
    const [message, setMessage] = useState('')
    console.log(receiver)

    const sendMessage = async() => {
        const msg = {sender: userInfo.current.mail, msg: message, datetime: Date.now(), receiver: receiver }
        socket.emit('send_msg', msg)
        setMessages((prev)=>[...prev, msg])
        setMessage('')
        try{
          const msgData = {
            message: message,
            datetime: Date.now(),
            emoji: [],
            isRead: false
          }
          const formData = new FormData()
          formData.append('sender', userInfo.current.mail)
          formData.append('receiver', receiver)
          formData.append('msgDetail', JSON.stringify(msgData))
          console.log(userInfo.current.mail)
          console.log(receiver)
  
          const {data} = await axios.post('http://localhost:3001/api/user/save-record',formData)
      
          if(data.success){
              console.log(data)
          }
        }catch(err){
          console.log(err)
        }

    }

  return (
    <div className='w-full h-[8vh] px-6 flex flex-row gap-2 justify-center items-center'>
        <input className='bg-slate-50 px-4 py-2 w-full rounded-full focus:outline-none' value={message} onChange={(e)=>setMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()}></input>
        <button className='bg-slate-600 rounded-2xl px-3 py-2 text-white font-blod' onClick={()=>sendMessage()}>Send</button>
    </div>
  )
}

export default InputField