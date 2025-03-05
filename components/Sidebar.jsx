'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { FiEdit3 } from "react-icons/fi";
import { IoSearchOutline } from "react-icons/io5";
import { IoAdd } from "react-icons/io5";
import { toast } from 'react-hot-toast';

const Sidebar = ({userInfo, setReceiver, receiver}) => {
  const [serchFriend, setSearchFriend] = useState('')
  const [friendList, setFriendList] = useState(userInfo.current.friendList)
  console.log(friendList)

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
          console.log(data.message)
          userInfo.current.friendList = data.message
          setFriendList(userInfo.current.friendList)
      }else{
          toast.error(data.message);
      }
    }else{
      toast.error('Friend Already Exist')
      return
    }
  }

  const getFriendInfo = async() => {

  }

  return (
    <div className='bg-green-500 h-[100vh] p-4'>
      <div className='sticky'>
        <div className='w-full flex flex-row items-center'>
          <img src={userInfo.current.image} className='w-16 rounded-full mr-4'/>
          <div className='flex flex-col'>
            <div className='flex flex-row items-center'>
              <p className='text-2xl font-bold mr-2'>{userInfo.current.name}</p>
              <FiEdit3 className='text-gray-700'/>
            </div>
            <div className='flex flex-row items-center'>
              <p className='text-xs text-gray-700 font-bold mr-2'>how is your feeling today! share with everyone!</p>
            </div>
          </div>
        </div>
        <div className='mt-8 w-full flex flex-row items-center gap-2'>
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
        {
          friendList.map((item)=>(
            <div key={item} className='w-full bg-white px-2' onClick={()=>setReceiver(item)}>
              {item}
            </div>
          ))
        }
      </div>

        {/* <input type='file' onChange={(e)=> setFile(e.target.files[0])}></input> */}
    </div>
  )
}

export default Sidebar