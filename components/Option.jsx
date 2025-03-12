'use client'
import React, { useEffect, useRef, useState } from 'react'
import { AiFillMessage } from "react-icons/ai";
import { BsFillPeopleFill } from "react-icons/bs";
import { RiLogoutCircleLine } from "react-icons/ri";

const Option = ({setGroupName, userInfo, setSwitchTo, swithTo, setReceiver, setIsProfileEdit, userImage}) => {

  return (
    <div className="flex flex-col justify-start items-center border-r-[1px] h-full">
        {/* 按鈕區塊 */}
        <div className="flex gap-6 flex-col items-center mt-4">
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
        <div className="mt-4 flex justify-center items-center absolute bottom-4 cursor-pointer" onClick={()=>{setIsProfileEdit(true); setGroupName(userInfo.current.name)}}>
            <img src={userImage} className="w-12 h-12 object-cover rounded-full" />
        </div>
    </div>

  )
}

export default Option