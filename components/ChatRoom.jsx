'use client'
import React, { useEffect, useRef, useState } from 'react'
import { BsThreeDots } from "react-icons/bs";
import InputField from './InputField';
import { MdExitToApp } from "react-icons/md";
import { IoCloseOutline } from "react-icons/io5";
import { IoIosArrowBack } from "react-icons/io";

const ChatRoom = ({messages, setMessages, socket, setIsOpenMessageRoom, receiver, userInfo, groupMember, setFriendInfo, setReceiver}) => {

    const [isShowLog, setIsShowLog] = useState(false)
    const scroller = useRef(null);

    useEffect(() => {
        if(!scroller.current) return

        scroller.current.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"})
    }, [messages])

    useEffect(()=>{
        socket.on('receive_msg', (msg)=>{
            if(msg.msgData.sender===userInfo.current.mail){
                setMessages((prev) =>
                    prev.map((m) =>
                      m.datetime === msg.msgData.datetime ? { ...m, image: msg.msgData.image, status: "sent" } : m
                    )
                  );
            }else{
                setMessages((prev)=>[...prev, msg.msgData])
            }
        })

        socket.on('exit_done', (msg) => {
        
            if (msg.msgData.account.mail === userInfo.current.mail) {
                userInfo.current = msg.msgData.account;
                setIsShowLog(false);
                setReceiver({ name: '', mail: '', image: '' });
            } else {
        
                setFriendInfo((prev) => {
                    return prev.map((item) => {
                        return item.mail === msg.msgData.account.mail ? msg.msgData.account : item;
                    });
                });
            }
            if(msg.msgData.member_left==='1'){
                setMessages((prev)=>{
                    return prev.filter((item)=>(
                        item.receiver !== msg.msgData.group_id && item.sender !== msg.msgData.group_id
                    ))
                })
            }
        });

        return () => {
            socket.off('receive_msg')
            socket.off('exit_done')
        }
    },[])
    
    const seenDatesByReceiver = new Set();
    const messagesWithFirstFlag = messages
    .sort((a, b) => a.datetime - b.datetime) 
    .filter((item) => {
      const msg_receiver = String(item.receiver); 
      const msg_sender = String(item.sender); 
  
      return (
        receiver.mail.includes('@')?
        (
        (msg_receiver.toLowerCase() === userInfo.current.mail.toLowerCase() && msg_sender.toLowerCase() === receiver.mail  && msg_sender.includes('@')) ||
        (msg_sender.toLowerCase() === userInfo.current.mail.toLowerCase() && msg_receiver.toLowerCase() === receiver.mail && msg_receiver.includes('@'))):
        (receiver.mail === (item.receiver || item.sender))
        
      );
    })
    .map(msg => {
        const dateOnly = new Date(msg.datetime).toLocaleDateString();

        const isFirst = !seenDatesByReceiver.has(dateOnly);
        seenDatesByReceiver.add(dateOnly);

        return { ...msg, isFirst };
    });

    const quitGroup = async(member) => {
        socket.emit('exit_group', { group_member: member, group_id: receiver.mail + '%' + receiver.name + '%', member_left: groupMember.length });
    }

  return receiver && (
    <div className='h-full flex flex-col relative'>
        <div className='bg-slate-50 pb-2 w-full mb-2 flex-grow overflow-auto'>
            <div className='bg-white py-3 flex justify-between items-center sticky top-0 border-b-[1px]'>
                <div className='px-2 md:px-6 flex flex-row justify-between w-full items-center'>
                    <div className='flex flex-row gap-5 items-center'>
                        <IoIosArrowBack className='flex text-2xl cursor-pointer md:hidden' onClick={()=>setIsOpenMessageRoom(false)}/>
                        <div className='flex flex-col'>
                            <p className='text-xl font-bold'>{receiver.name}</p>
                            <p className='text-xs text-gray-500'>{receiver.mail&& !receiver.mail.includes('@')? groupMember.length + ' Members':''}</p>
                        </div>
                    </div>
                    <BsThreeDots className="text-[22px] text-gray-600 cursor-pointer" onClick={() => setIsShowLog(true)} />
                </div>
            </div>
            <div className='p-2 md:p-6 overflow-y-scroll'>
                    {messagesWithFirstFlag.filter((item) => (item.receiver === userInfo.current.mail.toLowerCase() && item.sender.toLowerCase() === receiver.mail) || (String(item.receiver) === String(receiver.mail) && String(item.sender.toLowerCase()) === String(userInfo.current.mail.toLowerCase())) || (String(item.receiver) === String(receiver.mail) || String(item.sender) === String(receiver.mail))).map((msg) => (
                <div key={msg.datetime} className="flex flex-col">

                    {msg.isFirst && (
                    <div className="flex justify-center py-1 items-center">
                        <p className="text-white text-sm text-center bg-gray-300 w-fit px-2 py-1 rounded-full">{new Date(msg.datetime).toLocaleDateString()}</p>
                    </div>
                    )}
                    <div className='flex flex-row gap-2'>
                        {msg.sender===receiver.mail?<img src={receiver.image} loading="lazy" className='w-12 h-12 object-cover rounded-full' />:(!msg.receiver.includes('@')&&msg.sender!==userInfo.current.mail)?<img src={groupMember.find((i)=>i.mail===msg.sender)?.image || 'https://i.postimg.cc/rzBzgkQL/360-F-65772719-A1-UV5k-Li5n-CEWI0-BNLLi-Fa-BPEk-Ubv5-Fv.jpg'} loading="lazy" className='w-12 h-12 object-cover rounded-full'></img>:''}
                        <div className={`flex flex-col w-full gap-1 mb-4 ${msg.sender.toLowerCase() === userInfo.current.mail.toLowerCase() ? 'items-end' : 'items-start'}`}>
                            <p className="text-xs text-gray-500">{msg.sender.toLowerCase()===userInfo.current.mail?userInfo.current.name:receiver.mail.includes('@')?receiver.name:groupMember.find((item)=>item.mail===msg.sender)?.name || 'Unknown'}</p>
                            <div className="flex flex-row gap-1 items-end">
                                {msg.sender === userInfo.current.mail && (
                                    <p className="text-xs text-gray-500">
                                        {new Date(msg.datetime).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" })}
                                    </p>
                                )}
                                <div className={`flex flex-col gap-2 ${msg.sender.toLowerCase()===userInfo.current.mail.toLowerCase()?'items-end':'items-start'}`}>
                                    {msg.image && msg.image.length > 0 ? (
                                        msg.image.map((item, index) => (
                                            <img className='rounded-md w-40 h-40 object-cover' key={index} loading="lazy" src={item} alt={`image-${index}`} />
                                        ))
                                        ) : null
                                    }
                                    {msg.msg.length>0?<p className={`w-fit px-4 py-1 rounded-b-lg ${msg.sender.toLowerCase()===userInfo.current.mail.toLowerCase()?'bg-green-500 rounded-l-lg text-white':'bg-slate-200 rounded-r-lg text-black'}`}>{msg.msg}</p>:''}
                                </div>
                                {msg.sender !== userInfo.current.mail && (
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
            messages={messages}
        />
        <div>
            <div className={`fixed inset-0 bg-gray-300 bg-opacity-50 transition-opacity duration-300 
                    ${isShowLog ? "opacity-100 visible" : "opacity-0 invisible"}`} 
                    onClick={() => setIsShowLog(false)}>
            </div>
            {/* 側邊欄 */}
            <div 
                className={`fixed right-0 top-0 rounded-l-3xl bg-white flex flex-col p-4 w-[80%] md:w-[55%] h-[100vh] min-w-[250px] gap-2 
                    transform transition-transform duration-[700ms] ease-in-out shadow-lg
                    ${isShowLog ? "translate-x-0" : "translate-x-full"}`}>
                <div className="w-full h-full flex flex-col justify-center items-center relative">
                    <div className='flex flex-col gap-2 justify-center items-center'>
                    {!receiver.mail?.includes('@') || false ? <div className={`flex ${groupMember.length>2?'flex-col': 'flex-row'} gap-2 justify-center items-center`}>
                </div>:''}
                {!receiver.mail?.includes('@') ? <div className={`flex ${groupMember.length>2?'flex-col': 'flex-row'} gap-2 justify-center items-center`}>
                    {groupMember.slice(0,1).map((i)=>(
                        <img key={i.image} src={i.image} loading="lazy" className='rounded-full w-12 h-12 object-cover'></img>
                    ))}
                    <div className='flex flex-row gap-2'>
                    {groupMember.slice(1,3).map((i)=>(
                        <img key={i.image} src={i.image} loading="lazy" className='rounded-full w-12 h-12 object-cover'></img>
                    ))}
                    </div>
                </div>:''}
                {receiver.mail?.includes('@') ? <img src={receiver.image} loading="lazy" className='rounded-full w-24 h-24 object-cover'></img>:''}
                        <h1 className='mt-4 font-bold text-lg'>{receiver.name}</h1>
                        {!receiver.mail?.includes('@') ?<div className='flex flex-row gap-2 items-center'>
                            <p className='text-xs text-gray-500'>{groupMember.length} members</p>
                        </div>:''}
                        <div className='flex flex-row gap-6 mt-12 items-center'>
                            <div className='flex flex-col gap-3 justify-center items-center'>
                                <div className='p-4 bg-slate-100 rounded-full cursor-pointer' onClick={()=>quitGroup(userInfo.current.mail)}>
                                    <MdExitToApp className='w-5 h-5'/>
                                </div>
                                <p className='text-gray-600'>Exit</p>
                            </div>
                        </div>
                        <p></p>
                    </div>
                    <button onClick={() => setIsShowLog(false)} className="absolute top-4 right-4 border-2 border-black text-black text-lg p-1 rounded">
                        <IoCloseOutline />
                    </button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default ChatRoom