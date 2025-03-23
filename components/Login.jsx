import React, { useState } from 'react'
import "react-toastify/dist/ReactToastify.css";
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';
import { FcGoogle } from "react-icons/fc";
import { ThreeDot } from "react-loading-indicators";
import { useForm } from 'react-hook-form';  // 引入 useForm

const Login = React.memo(({ userName, setUserName, setIsLogin, userMail, setUserMail, userInfo, setFriendInfo, setMessages, setUserImage }) => {

    const [login, setLogin] = useState('Login')
    const [isLoading, setIsLoading] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm();

    const loginToChat = async (data) => {
        setIsLoading(true)
        if (data.email && data.password) {
            const formData = new FormData()
            formData.append('email', data.email)
            formData.append('password', data.password)

            const { data: responseData } = await axios.post('https://server-chat-app-iu9t.onrender.com/api/user/log-in', formData)
            if (responseData.success) {
                setIsLoading(false)
                setUserImage(responseData.message.image)
                setIsLogin(true)
                toast.success('Log in');
                userInfo.current = responseData.message
                setFriendInfo(responseData.friendInfo)
                getHistoryDialogue(responseData)
            } else {
                setIsLoading(false)
                toast.error(responseData.message);
            }
        } else {
            toast.error('Please complete all the fields');
        }
    }

    const singUp = async (data) => {
        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append('name', data.name)
            formData.append('email', data.email)
            formData.append('password', data.password)

            const { data: responseData } = await axios.post('https://server-chat-app-iu9t.onrender.com/api/user/sign-up', formData)

            if (responseData.success) {
                setIsLoading(false)
                toast.success('Sign up success');
                console.log(responseData)
            } else {
                setIsLoading(false)
                toast.error('User already exists');
            }
        } catch (err) {
            setIsLoading(false)
            console.log(err)
        }
    }

    const getUserByGoogle = async (name, email, picture) => {
        try {
            const formData = new FormData()
            formData.append('name', name)
            formData.append('email', email)
            formData.append('picture', picture)

            const { data } = await axios.post('https://server-chat-app-iu9t.onrender.com/api/user/google-log-in', formData)

            if (data.success) {
                setUserImage(data.message.image)
                setIsLogin(true)
                toast.success('Log in');
                userInfo.current = data.message
                setFriendInfo(data.friendInfo)
                getHistoryDialogue(data)
            }
        } catch (err) {
            console.log(err)
        }
    }

    const getHistoryDialogue = (data) => {
        let historyChat = []
        for (let i = 0; i < data.historyConversation.length; i++) {
            for (let inner = 0; inner < data.historyConversation[i].msg.length; inner++) {
                let transform = {
                    sender: data.historyConversation[i].sender,
                    msg: data.historyConversation[i].msg[inner].message,
                    datetime: data.historyConversation[i].msg[inner].datetime,
                    receiver: data.historyConversation[i].receiver,
                    image: data.historyConversation[i].msg[inner].image,
                }
                historyChat.push(transform)
            }
        }
        setMessages([])
        setMessages(historyChat)
    }

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const res = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokenResponse.access_token}`);
                const userInfo = await res.json();
                getUserByGoogle(userInfo.given_name, userInfo.email, userInfo.picture);
                setUserName(userInfo.given_name);
                setUserMail(userInfo.email);
                setPicture(userInfo.picture);
            } catch (err) {
                console.error("Google Login Error: ", err);
            }
        },
        onError: () => {
            console.log('Login Failed');
        },
        flow: 'implicit',
        redirect_uri: 'https://client-chat-app-ecru.vercel.app/auth/callback',
    });

    return (
        <div className='w-full flex justify-center items-center h-[100vh] flex-col relative'>
            <div className='flex flex-col items-center z-10 min-w-[290px]'>
                <p className='mb-12 font-extrabold text-green-500 text-[40px]'>{login}</p>
                <div className='flex flex-col w-full max-w-[300px] gap-2'>
                    {login === 'Login' ? (
                        <form onSubmit={handleSubmit(loginToChat)} className='flex flex-col w-full max-w-[300px] gap-2'>
                            <input
                                {...register('email', { required: 'Email is required' })}
                                type='text'
                                placeholder='Email'
                                className='border-2 p-2 rounded-full w-full focus:outline-none pl-4'
                            />
                            <input
                                {...register('password', { required: 'Password is required' })}
                                type='password'
                                placeholder='Password'
                                className='border-2 p-2 rounded-full w-full focus:outline-none mb-4 pl-4'
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`font-bold py-2 rounded-full ${(!userMail || !userPassword) ? 'bg-gray-200 text-gray-600' : 'bg-green-500 text-white'}`}
                            >
                                {isLoading ? <ThreeDot color="#fdfdfd" size='small' /> : "Join Chat"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmit(singUp)} className='flex flex-col w-full max-w-[300px] gap-2'>
                            <input
                                {...register('name', { required: 'Name is required' })}
                                type='text'
                                placeholder='Name'
                                className='border-2 p-2 rounded-full w-full focus:outline-none pl-4'
                            />
                            <input
                                {...register('email', { required: 'Email is required' })}
                                type='text'
                                placeholder='Email'
                                className='border-2 p-2 rounded-full w-full focus:outline-none pl-4'
                            />
                            <input
                                {...register('password', { required: 'Password is required' })}
                                type='password'
                                placeholder='Password'
                                className='border-2 p-2 rounded-full w-full focus:outline-none mb-4 pl-4'
                            />
                            <button type="submit" className={`font-bold py-2 rounded-full ${(userName === '' || userPassword === '' || userMail === '') ? 'bg-gray-200 text-gray-600' : 'bg-green-500 text-white'}`}>
                                Sign Up
                            </button>
                        </form>
                    )}

                    <div className="flex items-center my-4">
                        <hr className="flex-grow border-gray-300" />
                        <p className="text-xs text-gray-500 mx-4">Or continue with</p>
                        <hr className="flex-grow border-gray-300" />
                    </div>
                    <div className='flex flex-row gap-6 min-w-[290px] cursor-pointer rounded-lg p-1 py-2 border-[1px] justify-center items-center shadow-md' onClick={googleLogin}>
                        <FcGoogle className='text-2xl' />
                        <p className='text-gray-600 text-sm'>{login === 'Login' ? 'Login' : 'Sign Up'} with Google</p>
                    </div>
                    {login === 'Login' ? (
                        <p className='flex justify-center mt-4 text-xs text-gray-600'>Don't have an account? <span className='underline ml-2 cursor-pointer' onClick={() => setLogin('Register')}>Register</span></p>
                    ) : (
                        <p className='flex justify-center mt-4 text-xs text-gray-600'>Already have an account? <span className='underline ml-2 cursor-pointer' onClick={() => setLogin('Login')}>Login</span></p>
                    )}
                </div>
            </div>
        </div>
    )
})

export default Login;
