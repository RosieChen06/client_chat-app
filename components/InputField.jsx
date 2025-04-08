'use client'
import React, { useState, useRef } from 'react'
import { IoIosSend } from "react-icons/io";
import { IoMdCloseCircle } from "react-icons/io";
import { FaImage } from "react-icons/fa6";
import { FaMicrophone } from "react-icons/fa";

const InputField = ({socket, setMessages, receiver, userInfo}) => {
    const [message, setMessage] = useState('')
    const [image, setImage] = useState([])
    const recognitionRef = useRef(null);
    const [isListening, setIsListening] = useState(false);

    const sendMessage = async() => {

        if (message.trim() || image.length===0) return;
        const msgData = {
          message: message,
          datetime: Date.now(),
          emoji: [],
          isRead: false,
        }

        const tempURL = image.map((img) => URL.createObjectURL(img));

        const newMessage = { sender: userInfo.current.mail, msg: message, datetime: msgData.datetime, receiver: receiver.mail, image: tempURL, status: "pending" };
        setMessages((prev) => [...prev, newMessage]);

        socket.emit('send_msg', { sender: userInfo.current.mail, receiver: receiver.mail, message: msgData, msgData, files: image });
        setMessage('')
        setImage([])
    }

    const handleRemoveImage = (i) => {
      let newArr = image.filter((_, index) => index !== i)
      setImage(newArr)
    }

    const startRecognition = () => {
      const SpeechRecognition =
        typeof window !== "undefined"
          ? window.webkitSpeechRecognition || window.SpeechRecognition
          : null;
  
      if (!SpeechRecognition) {
        alert("Audio functions is not available.");
        return;
      }
  
      const recognition = new SpeechRecognition();
      recognition.lang = "en";
      recognition.continuous = false;
      recognition.interimResults = false;
  
      recognition.onresult = (event) => {
        const result = event.results[0][0].transcript;
        setMessage(`${result}`)
        console.log(`${result}`)
      };
  
      recognition.onerror = (event) => {
        console.log(event.error)
      };
  
      recognition.onend = () => {
        setIsListening(false);
      };
  
      recognition.start();
      recognitionRef.current = recognition;
      console.log('Recording...')
      setIsListening(true);
    };

  return (
    <div className={`bg-white border-t-[1px] w-full py-3 ${image.length>0? 'rounded-t-lg':''}`}>
      {image.length>0?
        <div className='w-full px-2 flex flex-row gap-2 justify-start items-center mb-4'>
          {image.map((img, index) => (
            <div key={index} className="relative">
              <img src={URL.createObjectURL(img)} loading="lazy" className="w-28" />
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
            <FaImage />
            <input type='file' id='image'
              onChange={(e) => {setImage(prev => [...prev, e.target.files[0]])}} hidden>
            </input>
          </label>  
          <button className={`${isListening?'text-green-600 bg-slate-200':'text-white bg-slate-600'} rounded-2xl px-3 py-2 font-blod`} onClick={()=>startRecognition()} disabled={isListening}><FaMicrophone /></button>  
          <input className='bg-slate-50 px-4 py-2 w-full rounded-full focus:outline-none' value={message} onChange={(e)=>setMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()}></input>
          <button className='bg-slate-600 rounded-2xl px-3 py-2 text-white font-blod' onClick={()=>sendMessage()}><IoIosSend /></button>
      </div>
    </div>
  )
}

export default InputField