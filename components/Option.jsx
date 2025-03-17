'use client'
import React, { useEffect, useRef, useState } from 'react'
import { AiFillMessage } from "react-icons/ai";
import { BsFillPeopleFill } from "react-icons/bs";
import { RiLogoutCircleLine } from "react-icons/ri";

const Option = React.memo(({setGroupName, userInfo, setSwitchTo, swithTo, setReceiver, setIsProfileEdit, userImage, setIsLogin}) => {
  
  return (
    <div className="flex bg-white flex-row md:flex-col justify-center md:justify-start items-center h-full">
        {/* 按鈕區塊 */}
        <div className="flex gap-16 md:gap-6 py-2 flex-row md:flex-col items-center md:mt-4">
            <div className={`p-2 rounded-md cursor-pointer ${swithTo==='Messages'?'bg-slate-200':'hover:bg-slate-200'}`} onClick={()=>setSwitchTo('Messages')}>
                <AiFillMessage className="text-[24px] text-gray-600" />
            </div>
            <div className={`p-2 rounded-md cursor-pointer ${swithTo==='People'?'bg-slate-200':'hover:bg-slate-200'}`} onClick={()=>{setSwitchTo('People'); setReceiver({name:'', mail:'', image:''})}}>
                <BsFillPeopleFill className="text-[24px] text-gray-600" />
            </div>
            <div className='bg-transparent p-2 rounded-md cursor-pointer hover:bg-slate-200' onClick={()=>setIsLogin(false)}>
                <RiLogoutCircleLine className="text-[24px] text-gray-600" />
            </div>
        </div>

        {/* 用戶圖片 */}
        <div className="ml-16 md:ml-0 md:mt-4 flex justify-center items-center md:absolute md:bottom-4 cursor-pointer" onClick={()=>{setIsProfileEdit(true); setGroupName(userInfo.current.name)}}>
            <img src={userImage} className="w-9 h-9 md:w-12 md:h-12 object-cover rounded-full" />
        </div>
    </div>

  )
})

export default Option