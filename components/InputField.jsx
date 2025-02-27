'use client'
import React, { useEffect, useState } from 'react'

const InputField = ({socket, user, room, setMessages}) => {
    const [message, setMessage] = useState('')

    const sendMessage = () => {
        const msg = {sender: user, msg: message, datetime: Date.now(), room: room }
        socket.emit('send_msg', msg)
        setMessages((prev)=>[...prev, msg])
        setMessage('')
    }

  return (
    <div className='w-full h-[8vh] px-6 flex flex-row gap-2 justify-center items-center'>
        <input className='bg-slate-50 px-4 py-2 w-full rounded-full focus:outline-none' value={message} onChange={(e)=>setMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()}></input>
        <button className='bg-slate-600 rounded-2xl px-3 py-2 text-white font-blod' onClick={()=>sendMessage()}>Send</button>
    </div>
  )
}

export default InputField