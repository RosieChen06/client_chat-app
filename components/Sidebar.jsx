'use client'
import React, { useState } from 'react'
import axios from 'axios'
import { FiEdit3 } from "react-icons/fi";
import { IoSearchOutline } from "react-icons/io5";
import { IoAdd } from "react-icons/io5";
import { toast } from 'react-hot-toast';
import { MdOutlineGroupAdd } from "react-icons/md";

const Sidebar = ({userInfo, setReceiver, receiver, friendInfo, setFriendInfo, swithTo, messages}) => {
  const [serchFriend, setSearchFriend] = useState('')

  const updateFriendList = async(AddorRemove) => {

    if(AddorRemove==='add' && ! userInfo.current.friendList.includes(serchFriend.toLocaleLowerCase())){
      const formData = new FormData()
      formData.append('email', userInfo.current.mail)
      formData.append('type', userInfo.current.type)
      formData.append('friendList', JSON.stringify(userInfo.current.friendList))
      formData.append('TAmail', serchFriend)
  
      const {data} = await axios.post('http://localhost:3001/api/user/edit-friendList',formData)
      if(data.success){
          toast.success('Friendlist Updated');
          // userInfo.current.friendList = data.message
          setFriendInfo(data.message)
      }else{
          toast.error(data.message);
      }
    }else{
      toast.error('Friend Already Exist')
      return
    }
  }

  return (
    <div className='bg-white h-[100vh] p-4 border-r-[1px]'>
      <div className='sticky'>
        {/* <div className='w-full flex flex-row items-center'>
          <img src={userInfo.current.image} className='w-16 rounded-full mr-4 relative'/>
          <div className='flex flex-col'>
            <div className='flex flex-row items-center'>
              <p className='text-2xl font-bold mr-2'>{userInfo.current.name}</p>
              <FiEdit3 className='text-gray-700'/>
            </div>
            <div className='flex flex-row items-center'>
              <p className='text-xs text-gray-700 font-bold mr-2'>how is your feeling today! share with everyone!</p>
            </div>
          </div>
        </div> */}
        <div className='flex flex-row w-full justify-between items-center'>
          <p className='font-extrabold text-[25px]'>{swithTo}</p>
          <div className='p-2 bg-slate-100 rounded-full'>
            <MdOutlineGroupAdd className='text-lg'/>
          </div>
        </div>
        <div className='mt-7 w-full flex flex-row items-center gap-2'>
          <input className='rounded-md h-8 mr-2 px-2 w-3/4 focus:outline-none' onChange={(e)=>setSearchFriend(e.target.value)} placeholder='Search by Mail'></input>
          <div className='border-2 rounded-md h-8 min-w-8 flex justify-center items-center cursor-pointer'>
            <IoSearchOutline className='text-lg flex rounded-md text-white'/>
          </div>
          <div className='border-2 rounded-md h-8 min-w-8 flex justify-center items-center cursor-pointer'>
            <IoAdd onClick={()=>updateFriendList('add')} className='text-lg flex rounded-md text-white'/>
          </div>
        </div>
      </div>
      <div className='mt-4 overflow-auto scrollbar-custom'>
        {friendInfo &&
          friendInfo.map((item)=>(
            <div key={item.mail} className={`w-full px-2 cursor-pointer rounded-md bg-white flex flex-row items-center gap-3 mt-3 py-2 ${receiver.mail===item.mail?'bg-slate-100':'hover:bg-slate-100'}`} onClick={()=>{setReceiver({name:item.name, image:item.image, mail:item.mail.toLowerCase()}); }}>
              <img src={item.image} className='w-16 rounded-full'></img>
              <div className='flex flex-col w-full pr-2'>
                <div className='flex flex-row justify-between items-center'>
                  <p className='font-bold'>{item.name}</p>
                  <p className='text-xs text-gray-600'>
                    {messages
                      .filter(i => (i.sender === item.mail && i.receiver === userInfo.current.mail) || (i.receiver === item.mail && i.sender === userInfo.current.mail))
                      .sort((a, b) => b.datetime - a.datetime)
                      .map(msg => new Date(msg.datetime).toLocaleDateString())[0] || "No messages"}
                  </p>
                </div>
                <p className='text-xs mt-2'>here is the last conversation</p>
              </div>
            </div>
          ))
        }
      </div>

        {/* <input type='file' onChange={(e)=> setFile(e.target.files[0])}></input> */}
    </div>
  )
}

export default Sidebar