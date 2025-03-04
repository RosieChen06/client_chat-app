'use client'
import React, { useState } from 'react'
import axios from 'axios'
import { FiEdit3 } from "react-icons/fi";
import { IoSearchOutline } from "react-icons/io5";
import { IoAdd } from "react-icons/io5";

const Sidebar = ({picture, userName}) => {
  const [file, setFile] = useState('')
  console.log(picture)
  return (
    <div className='bg-green-500 h-[100vh] p-4'>
      <div className='sticky'>
        <div className='w-full flex flex-row items-center'>
          <img src={picture} className='w-16 rounded-full mr-4'/>
          <div className='flex flex-col'>
            <div className='flex flex-row items-center'>
              <p className='text-2xl font-bold mr-2'>{userName}</p>
              <FiEdit3 className='text-gray-700'/>
            </div>
            <div className='flex flex-row items-center'>
              <p className='text-xs text-gray-700 font-bold mr-2'>how is your feeling today! share with everyone!</p>
            </div>
          </div>
        </div>
        <div className='mt-8 w-full flex flex-row items-center gap-2'>
          <input className='rounded-md h-8 mr-2 px-2 w-3/4 focus:outline-none' placeholder='Search by Mail'></input>
          <div className='border-2 rounded-md h-8 min-w-8 flex justify-center items-center cursor-pointer'>
            <IoSearchOutline className='text-lg flex rounded-md text-white'/>
          </div>
          <div className='border-2 rounded-md h-8 min-w-8 flex justify-center items-center cursor-pointer'>
            <IoAdd className='text-lg flex rounded-md text-white'/>
          </div>
        </div>
      </div>
      <div className='mt-4 overflow-auto scrollbar-custom'>
        friendlist
      </div>

        {/* <input type='file' onChange={(e)=> setFile(e.target.files[0])}></input> */}
    </div>
  )
}

export default Sidebar