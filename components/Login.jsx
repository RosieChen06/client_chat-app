'use client'
import React, { useRef, useState } from 'react'
import "react-toastify/dist/ReactToastify.css";
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

const Login = ({userName, setUserName, setIsLogin, socket, userMail, setUserMail, userInfo, setFriendInfo, setMessages}) => {

    const [login, setLogin] = useState('Login')
    const [userPassword, setUserPssword] = useState('')
    const [picture, setPicture] = useState('')

    const loginToChat = async() => {
        if(userMail!=='' && userPassword !==''){
            const formData = new FormData()
            formData.append('email', userMail)
            formData.append('password', userPassword)
      
            const {data} = await axios.post('http://localhost:3001/api/user/log-in',formData)
            if(data.success){
                setIsLogin(true)
                toast.success('Log in');
                userInfo.current = data.message
                setFriendInfo(data.friendInfo)
                getHistoryDialogue(data)
            }else{
                toast.error(data.message);
            }
        }else{
            toast.error('Pleas complete all the fields');
        }
    }

    const singUp = async() => {
        try{
          const formData = new FormData()
          formData.append('name', userName)
          formData.append('email', userMail)
          formData.append('password', userPassword)
          // formData.append('image', file)
    
          const {data} = await axios.post('http://localhost:3001/api/user/sign-up',formData)
    
          if(data.success){
            toast.success('Sign up success');
            console.log(data)
          }else{
            toast.error('User already exist');
          }
        }catch(err){
          console.log(err)
        }
      }
    
    const getUserByGoogle = async(name, email, picture) => {
        try{
            const formData = new FormData()
            formData.append('name', name)
            formData.append('email', email)
            formData.append('picture', picture)

            const {data} = await axios.post('http://localhost:3001/api/user/google-log-in',formData)
        
            if(data.success){
                setIsLogin(true)
                toast.success('Log in');
                userInfo.current = data.message
                setFriendInfo(data.friendInfo)
                getHistoryDialogue(data)
            }
        }catch(err){
            console.log(err)
        }
    }

    const getHistoryDialogue = (data) => {
        let historyChat = []
        for(let i =0; i<data.historyConversation.length; i++){
            for(let inner=0; inner<data.historyConversation[i].msg.length; inner++){
                let trasform = {
                    sender: data.historyConversation[i].sender,
                    msg: data.historyConversation[i].msg[inner].message,
                    datetime: data.historyConversation[i].msg[inner].datetime,
                    receiver: data.historyConversation[i].receiver,
                    image: data.historyConversation[i].msg[inner].image,
                }
                historyChat.push(trasform)
            }
        }
        console.log(historyChat)
        setMessages([])
        setMessages(historyChat)
    }

  return (
    <div className='w-full flex justify-center items-center h-[100vh] flex-col'>
        <p className='mb-12 font-extrabold text-green-500 text-[40px]'>{login}</p>
        <div className='flex flex-col w-full max-w-[300px] gap-2'>
            {login==='Login'?
            <div className='flex flex-col w-full max-w-[300px] gap-2'>
                <input type='text' placeholder='Email' className='border-2 p-2 rounded-full w-full focus:outline-none pl-4' onChange={(e)=>setUserMail(e.target.value)} value={userMail}></input>
                <input type='text' placeholder='Password' className='border-2 p-2 rounded-full w-full focus:outline-none mb-4 pl-4' onChange={(e)=>setUserPssword(e.target.value)} value={userPassword}></input>
                <button className={`font-bold py-2 rounded-full ${(userMail==='' || userPassword==='')?'bg-gray-200 text-gray-600':'bg-green-500 text-white'}`} onClick={()=>loginToChat()}>Join Chat</button>
            </div>:
            <div className='flex flex-col w-full max-w-[300px] gap-2'>
                <input type='text' placeholder='Name' className='border-2 p-2 rounded-full w-full focus:outline-none pl-4' onChange={(e)=>setUserName(e.target.value)} value={userName}></input>
                <input type='text' placeholder='Email' className='border-2 p-2 rounded-full w-full focus:outline-none pl-4' onChange={(e)=>setUserMail(e.target.value)} value={userMail}></input>
                <input type='text' placeholder='Password' className='border-2 p-2 rounded-full w-full focus:outline-none mb-4 pl-4' onChange={(e)=>setUserPssword(e.target.value)} value={userPassword}></input>
                <button className={`font-bold py-2 rounded-full ${(userName==='' || userPassword==='' || userMail==='')?'bg-gray-200 text-gray-600':'bg-green-500 text-white'}`} onClick={()=>singUp()}>Sign Up</button>
            </div>
            }
            <div className="flex items-center my-4">
                <hr className="flex-grow border-gray-300" />
                <p className="text-xs text-gray-500 mx-4">Or continue with</p>
                <hr className="flex-grow border-gray-300" />
            </div>
            <div className='flex flex-row gap-2 w-full'>
                <GoogleLogin 
                    onSuccess={(credentialResponse) => {
                        const credentialResponseDecoded = jwtDecode(credentialResponse.credential)
                        console.log(credentialResponseDecoded);
                        getUserByGoogle(credentialResponseDecoded.given_name, credentialResponseDecoded.email, credentialResponseDecoded.picture)
                        setUserName(credentialResponseDecoded.given_name)
                        setUserMail(credentialResponseDecoded.email)
                        setPicture(credentialResponseDecoded.picture)
                    }}
                    onError={() => {
                        console.log('Login Failed');
                    }}
                />
                <button className='w-1/2 border-2 p-1'>facebook</button>
            </div>
            {login==='Login'?
                <p className='flex justify-center mt-4 text-xs text-gray-600'>Don't have a account? <span className='underline ml-2 cursor-pointer' onClick={()=> setLogin('Register')}>Register</span></p>:
                <p className='flex justify-center mt-4 text-xs text-gray-600'>Already have a account? <span className='underline ml-2 cursor-pointer' onClick={()=> setLogin('Login')}>Login</span></p>
            }
        </div>
    </div>
  )
}

export default Login