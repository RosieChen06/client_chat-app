'use client'
import React, { useEffect, useRef, useState } from 'react'
import { LuMenu } from "react-icons/lu";

const ChatRoom = ({messages, setMessages, socket, user, setLog, log, room}) => {

    const [isShowLog, setIsShowLog] = useState(false)
    const wrapperRef = useRef(null); 

    const scroller = useRef(null);

    useEffect(() => {
        if(!scroller.current) return

        scroller.current.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"})
    }, [messages])

    useEffect(()=>{
        socket.on('receive_msg', (msg)=>{
            setMessages((prev)=>[...prev, msg])
        })

        socket.on('receiveLog', (msg)=>{
            setLog((prev)=>[...prev, msg])
        })

        return () => {
            socket.off('receive_msg')
            socket.off('receiveLog')
        }
    },[])

    useEffect(()=>{
        socket.emit('check-user-status', socket.id)
    },[])

    useEffect(() => {
        const handleClickOutside = (e) => {
          if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
            setIsShowLog(false);
          }
        };

        document.addEventListener('click', handleClickOutside);
    
        return () => {
          document.removeEventListener('click', handleClickOutside);
        };
      }, []);

    const seenDates = new Set();
    const messagesWithFirstFlag = messages.filter((msg)=>(msg.room===room)).map(msg => {
        const dateOnly = new Date(msg.datetime).toLocaleDateString();
        const isFirst = !seenDates.has(dateOnly);
        seenDates.add(dateOnly);
        return { ...msg, isFirst };
    });
    
  return (
    <div className='h-[90vh] bg-slate-50 pb-2 w-full mb-2 flex flex-col'>
        <div className='bg-white h-[8vh] min-h-[60px] px-6 flex justify-between items-center'>
            <div>
                <p className='text-2xl font-bold'>{room}</p>
            </div>
            <div ref={wrapperRef} className='relative'>
                <LuMenu className="text-[29px] cursor-pointer" onClick={() => setIsShowLog(true)} />
                {isShowLog?
                    <div className='absolute right-0 top-11 bg-white flex flex-col p-2 w-72 h-fit min-w-[250px] gap-2'>
                    {
                        log.filter((msg)=>(msg.room===room)).map((log)=>(
                            <div key={log.dateTime} className='flex flex-row text-sm gap-4 items-center'>
                                <p className='text-gray-400'>{new Date(log.dateTime).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" })}</p>
                                <p>{log.user} <span className={`font-bold ${log.type==='join'?'text-green-500':'text-red-500'}`}>{log.type}</span> the room</p>
                            </div>
                        ))
                    }
                </div>:''
                }
            </div>
        </div>
        <div className='p-6 h-[84vh] overflow-auto scrollbar-custom'>
                {messagesWithFirstFlag.map((msg) => (
            <div key={msg.datetime} className="flex flex-col">

                {msg.isFirst && (
                <div className="flex justify-center py-1 items-center">
                    <p className="text-white text-sm text-center bg-gray-300 w-fit px-2 py-1 rounded-full">{new Date(msg.datetime).toLocaleDateString()}</p>
                </div>
                )}

                <div className={`flex flex-col gap-1 mb-4 ${msg.sender === user ? 'items-end' : 'items-start'}`}>
                    <p className="text-xs text-gray-500">{msg.sender}</p>
                    <div className="flex flex-row gap-1 items-end">

                        {msg.sender === user && (
                        <p className="text-xs text-gray-500">
                            {new Date(msg.datetime).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" })}
                        </p>
                        )}
                        
                        <p className={`w-fit px-4 py-1 rounded-full ${msg.sender===user?'bg-green-500 text-white':'bg-slate-200 text-black'}`}>{msg.msg}</p>
                        
                        {msg.sender !== user && (
                        <p className="text-xs text-gray-500">
                            {new Date(msg.datetime).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" })}
                        </p>
                        )}
                    </div>
                </div>
            </div>
            ))}
            <div ref={scroller}/>
        </div>
    </div>
  )
}

export default ChatRoom