'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { IoIosSend } from "react-icons/io";
import { MdOutlineFileUpload } from "react-icons/md";
import { IoMdCloseCircle } from "react-icons/io";

const InputField = ({socket, setMessages, receiver, userInfo}) => {
    const [message, setMessage] = useState('')
    const [image, setImage] = useState([])
    console.log(image)

    const sendMessage = async() => {
        const msg = {sender: userInfo.current.mail, msg: message, datetime: Date.now(), receiver: receiver.mail }
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
          formData.append('receiver', receiver.mail)
          formData.append('msgDetail', JSON.stringify(msgData))
  
          const {data} = await axios.post('http://localhost:3001/api/user/save-record',formData)
      
          if(data.success){
              console.log(data)
          }
        }catch(err){
          console.log(err)
        }

    }

    const handleRemoveImage = (i) => {
      console.log(i)
      let newArr = image.filter((_, index) => index !== i)
      setImage(newArr)
    }

  return (
    <div className={`bg-white w-full py-3 ${image.length>0? 'rounded-t-lg':''}`}>
      {image.length>0?
        <div className='w-full px-2 flex flex-row gap-2 justify-start items-center mb-4'>
          {image.map((img, index) => (
            <div key={index} className="relative">
              <img src={URL.createObjectURL(img)} className="w-28" />
              <IoMdCloseCircle 
                className="absolute top-[-8px] right-[-8px] text-xl cursor-pointer" 
                onClick={() => handleRemoveImage(index)}
              />
            </div>
          ))}
        </div>:''
      }
      <div className='w-full px-2 flex flex-row gap-2 justify-center items-center'>
          <label htmlFor="image" className="cursor-pointer bg-slate-600 rounded-2xl px-3 py-2 text-white font-bold flex items-center">
            <MdOutlineFileUpload />
            <input type='file' id='image'
              onChange={(e) => {setImage(prev => [...prev, e.target.files[0]])}} hidden>
            </input>
          </label>    
          <input className='bg-slate-50 px-4 py-2 w-full rounded-full focus:outline-none' value={message} onChange={(e)=>setMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()}></input>
          <button className='bg-slate-600 rounded-2xl px-3 py-2 text-white font-blod' onClick={()=>sendMessage()}><IoIosSend /></button>
      </div>
    </div>
  )
}

export default InputField