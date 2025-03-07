'use client'
import React, { useEffect, useRef, useState } from 'react'
import { BsThreeDots } from "react-icons/bs";
import InputField from './InputField';

const ChatRoom = ({messages, setMessages, socket, user, log, receiver, userInfo}) => {

    const [isShowLog, setIsShowLog] = useState(false)
    const wrapperRef = useRef(null); 
    const scroller = useRef(null);
    console.log(messages)

    useEffect(() => {
        if(!scroller.current) return

        scroller.current.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"})
    }, [messages])

    useEffect(()=>{
        socket.on('receive_msg', (msg)=>{
            setMessages((prev)=>[...prev, msg.msgData])
        })

        return () => {
            socket.off('receive_msg')
        }
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

    const seenDatesByReceiver = new Set();
    const messagesWithFirstFlag = messages.sort((a, b)=>a.datetime - b.datetime).filter((item)=>(item.receiver === user.toLowerCase() && item.sender.toLowerCase() === receiver.mail) || (item.receiver === receiver.mail && item.sender.toLowerCase() === user.toLowerCase())).map(msg => {
        const dateOnly = new Date(msg.datetime).toLocaleDateString();

        const isFirst = !seenDatesByReceiver.has(dateOnly);
        seenDatesByReceiver.add(dateOnly);

        return { ...msg, isFirst };
    });

    console.log(isShowLog)
    
  return receiver && (
    <div className='h-full flex flex-col relative'>
        <div className='bg-slate-50 pb-2 w-full mb-2 flex-grow overflow-auto'>
            <div className='bg-white py-3 flex justify-between items-center sticky top-0 border-b-[1px]'>
                <div className='px-6 flex flex-row justify-between w-full items-center'>
                    <p className='text-2xl font-bold'>{receiver.name}</p>
                    <BsThreeDots ref={wrapperRef} className="text-[22px] text-gray-600 cursor-pointer" onClick={() => setIsShowLog(true)} />
                </div>
                {/* <div ref={wrapperRef}>
                    <BsThreeDots className="text-[22px] mr-6 text-gray-600 cursor-pointer" onClick={() => setIsShowLog(true)} />
                    {isShowLog?
                        <div className='absolute right-0 top-0 bg-blue-300 flex flex-col p-2 w-[75%] h-[100vh] min-w-[250px] gap-2'>
                            
                        </div>:''
                    }
                </div> */}
            </div>
            <div className='p-6 overflow-y-scroll'>
                    {messagesWithFirstFlag.filter((item) => (item.receiver === user.toLowerCase() && item.sender.toLowerCase() === receiver.mail) || (item.receiver === receiver.mail && item.sender.toLowerCase() === user.toLowerCase())).map((msg) => (
                <div key={msg.datetime} className="flex flex-col">

                    {msg.isFirst && (
                    <div className="flex justify-center py-1 items-center">
                        <p className="text-white text-sm text-center bg-gray-300 w-fit px-2 py-1 rounded-full">{new Date(msg.datetime).toLocaleDateString()}</p>
                    </div>
                    )}
                    <div className='flex flex-row gap-2'>
                        {msg.sender===receiver.mail?<img src={receiver.image} className='w-12 h-12 rounded-full' />:''}
                        <div className={`flex flex-col w-full gap-1 mb-4 ${msg.sender.toLowerCase() === user.toLowerCase() ? 'items-end' : 'items-start'}`}>
                            <p className="text-xs text-gray-500">{msg.sender.toLowerCase()===user?userInfo.current.name:receiver.name}</p>
                            <div className="flex flex-row gap-1 items-end">

                                {msg.sender === user && (
                                <p className="text-xs text-gray-500">
                                    {new Date(msg.datetime).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" })}
                                </p>
                                )}
                                <div className={`flex flex-col gap-2 ${msg.sender.toLowerCase()===user.toLowerCase()?'items-end':'items-start'}`}>
                                    {msg.image && msg.image.length > 0 ? (
                                        msg.image.map((item, index) => (
                                            <img className='rounded-md w-40' key={index} src={item} alt={`image-${index}`} />
                                        ))
                                        ) : null}
                                    <p className={`w-fit px-4 py-1 rounded-b-lg ${msg.sender.toLowerCase()===user.toLowerCase()?'bg-green-500 rounded-l-lg text-white':'bg-slate-200 rounded-r-lg text-black'}`}>{msg.msg}</p>
                                </div>
                                {msg.sender !== user && (
                                <p className="text-xs text-gray-500">
                                    {new Date(msg.datetime).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" })}
                                </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                ))}
                <div ref={scroller}/>
            </div>
        </div>
        <InputField className="h-fit w-full"
            socket={socket}
            setMessages={setMessages}
            receiver={receiver}
            userInfo={userInfo}
        />
        <div ref={wrapperRef}>
            {isShowLog?
                <div className='absolute right-0 top-0 bg-blue-300 flex flex-col p-2 w-[75%] h-[100vh] min-w-[250px] gap-2'>
                    
                </div>:''
            }
        </div>
    </div>
  )
}

export default ChatRoom