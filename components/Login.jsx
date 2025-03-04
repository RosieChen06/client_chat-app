'use client'
import React, { useState } from 'react'
import "react-toastify/dist/ReactToastify.css";
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

const Login = ({userName, setUserName,room, setRoom, setIsLogin, socket, setLog, userMail, setUserMail ,setPicture}) => {

    const [login, setLogin] = useState('Login')
    const [userPassword, setUserPssword] = useState('')

    const loginToChat = async() => {
        if(userName!=='' && room !==''){
            const formData = new FormData()
            formData.append('email', userMail)
            formData.append('password', userPassword)
            // formData.append('image', file)
      
            const {data} = await axios.post('http://localhost:3001/api/user/log-in',formData)
            console.log(data)
            if(data.success){
                const loginInfo = {user: data.message.name, room: '2701', type:'join', dateTime: Date.now()}
                socket.emit('login', loginInfo)
                setLog((prev)=>[...prev, loginInfo])
                setIsLogin(true)
                toast.success('Log in');
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
            formData.append('picture', email)

            const {data} = await axios.post('http://localhost:3001/api/user/google-log-in',formData)
        
            if(data.success){
                console.log(data)
            }
        }catch(err){
            console.log(err)
        }
    }

  return (
    <div className='w-full flex justify-center items-center h-[100vh] flex-col'>
        <p className='mb-12 font-extrabold text-green-500 text-[40px]'>{login}</p>
        <div className='flex flex-col w-full max-w-[300px] gap-2'>
            {login==='Login'?
            <div className='flex flex-col w-full max-w-[300px] gap-2'>
                <input type='text' placeholder='Email' className='border-2 p-2 rounded-full w-full focus:outline-none pl-4' onChange={(e)=>setUserName(e.target.value)} value={userName}></input>
                <input type='text' placeholder='Password' className='border-2 p-2 rounded-full w-full focus:outline-none mb-4 pl-4' onChange={(e)=>setRoom(e.target.value)} value={room}></input>
                <button className={`font-bold py-2 rounded-full ${(userName==='' || room==='')?'bg-gray-200 text-gray-600':'bg-green-500 text-white'}`} onClick={()=>loginToChat()}>Join Chat</button>
            </div>:
            <div className='flex flex-col w-full max-w-[300px] gap-2'>
                <input type='text' placeholder='Name' className='border-2 p-2 rounded-full w-full focus:outline-none pl-4' onChange={(e)=>setUserName(e.target.value)} value={userName}></input>
                <input type='text' placeholder='Email' className='border-2 p-2 rounded-full w-full focus:outline-none pl-4' onChange={(e)=>setUserMail(e.target.value)} value={userMail}></input>
                <input type='text' placeholder='Password' className='border-2 p-2 rounded-full w-full focus:outline-none mb-4 pl-4' onChange={(e)=>setUserPssword(e.target.value)} value={userPassword}></input>
                <button className={`font-bold py-2 rounded-full ${(userName==='' || room==='')?'bg-gray-200 text-gray-600':'bg-green-500 text-white'}`} onClick={()=>singUp()}>Sign Up</button>
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
                        const loginInfo = {user: credentialResponseDecoded.given_name, room: '2701', type:'join', dateTime: Date.now()}
                        socket.emit('login', loginInfo)
                        setLog((prev)=>[...prev, loginInfo])
                        getUserByGoogle(credentialResponseDecoded.given_name, credentialResponseDecoded.email, credentialResponseDecoded.picture)
                        setUserName(credentialResponseDecoded.given_name)
                        setUserMail(credentialResponseDecoded.email)
                        setPicture(credentialResponseDecoded.picture)
                        setIsLogin(true)
                        toast.success('Log in');
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