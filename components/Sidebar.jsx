'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { FiEdit3 } from "react-icons/fi";
import { IoSearchOutline } from "react-icons/io5";
import { IoAdd } from "react-icons/io5";
import { toast } from 'react-hot-toast';
import { MdOutlineGroupAdd } from "react-icons/md";
import Select from 'react-select'
import makeAnimated from 'react-select/animated';

const Sidebar = ({userInfo, setReceiver, receiver, friendInfo, setFriendInfo, swithTo, messages, groupMember, setGroupMember}) => {
  const [serchFriend, setSearchFriend] = useState('')
  const [addGroup, setAddGroup] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [groupName, setGroupName] = useState('')

  // 處理選擇變更
  const handleChange = (selected) => {
      setSelectedOptions(selected);
      console.log("Selected:", selected);
  };

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

  const [optionsData, setOptionsData] = useState(userInfo.current.friendList);

  const options = optionsData.map(option => ({
      value: option,   // 將 id 作為 value
      label: option  // 將 name 作為 label
  }));

  const createGroup = async() => {

    let groupMember = []
    let group_id = Date.now()

    for(let i=0; i<selectedOptions.length; i++){
      groupMember.push(selectedOptions[i].value)
    }
    userInfo.current.groupList.push(group_id + '%' + groupName + '%')
    groupMember.push(userInfo.current.mail)
    setFriendInfo(prevFriends =>
        prevFriends.map(friend =>
            groupMember.includes(friend.mail)
                ? { ...friend, groupList: [...friend.groupList, group_id + '%' + groupName + '%'] }
                : friend
        )
    );
    setReceiver({name: groupName, mail: group_id, })

    const formData = new FormData()
    formData.append('group_member', JSON.stringify(groupMember))
    formData.append('group_id', group_id + '%' + groupName + '%')

    const {data} = await axios.post('http://localhost:3001/api/user/edit-groupList',formData)
    if(data.success){
      setGroupMember(data.message)
      setAddGroup(false)
      setSelectedOptions([])
      setGroupName('')
    }else{
        toast.error(data.message);
    }
  }

  const chatRecord = new Set();

  const roomFlag = messages
    .sort((a, b) => b.datetime - a.datetime) 
    .filter((item) => {
      const receiver = String(item.receiver); 
      const sender = String(item.sender); 
  
      return (
        (receiver.toLowerCase() === userInfo.current.mail.toLowerCase() && receiver.includes('@') ) ||
        (sender.toLowerCase() === userInfo.current.mail.toLowerCase() && sender.includes('@') )  ||
        userInfo.current.groupList.some((i) =>
          i.split('%')[0] === receiver || i.split('%')[0] === sender
        )
      );
    })
    .map((msg) => {
      const receiver = String(msg.receiver); 
      const sender = String(msg.sender); 
  
      const room = receiver === userInfo.current.mail.toLowerCase() ? sender : receiver;
  
      const isShow = !chatRecord.has(room);
      chatRecord.add(room);

      return { ...msg, isShow };
    });

    const receiverInfo = async(info) => {
      if(!info.sender.includes('@')){
        const matchedGroup = userInfo.current.groupList.find((i) => i.split('%')[0] === info.sender);

        const formData = new FormData()
        formData.append('group_id', info.sender+'%'+matchedGroup.split('%')[1]+'%')

        const {data} = await axios.post('http://localhost:3001/api/user/get-member',formData)
    
        if(data.success){
            setGroupMember(data.message)
        }
        setReceiver({
          name: matchedGroup.split('%')[1],
          mail: info.sender
        })
      }else if(!info.receiver.includes('@')){
        const matchedGroup = userInfo.current.groupList.find((i) => i.split('%')[0] === info.receiver);
        const formData = new FormData()
        formData.append('group_id', info.receiver+'%'+matchedGroup.split('%')[1]+'%')

        const {data} = await axios.post('http://localhost:3001/api/user/get-member',formData)
    
        if(data.success){
           setGroupMember(data.message)
        }
        setReceiver({
          name: matchedGroup.split('%')[1],
          mail: info.receiver
        })
      }
      else if(info.sender.toLowerCase()===userInfo.current.mail.toLowerCase()){
        const select = friendInfo.find((item)=>(
          item.mail===info.receiver
        )) || info.receiver
        console.log(select)
        setReceiver({
          name: select.name,
          image: select.image,
          mail: info.receiver
      })
      }else{
        const select = friendInfo.find((item)=>(
          item.mail===info.sender
        ))
        console.log(select)
        setReceiver({
            name: select.name,
            image: select.image,
            mail: info.sender
        })
    }
  }
  
  return friendInfo && (
    <div className='bg-white h-[100vh] p-4 border-r-[1px]'>
      <div className='sticky h-[6%]'>
        <div className='flex flex-row w-full justify-between items-center'>
          <p className='font-extrabold text-[25px]'>{swithTo}</p>
          <div className='p-2 bg-slate-100 rounded-full'>
            <MdOutlineGroupAdd className='text-lg' onClick={()=>setAddGroup(true)}/>
          </div>
        </div>
        {/* <div className='mt-7 w-full flex flex-row items-center gap-2'>
          <input className='rounded-md h-8 mr-2 px-2 w-3/4 focus:outline-none' onChange={(e)=>setSearchFriend(e.target.value)} placeholder='Search by Mail'></input>
          <div className='border-2 rounded-md h-8 min-w-8 flex justify-center items-center cursor-pointer'>
            <IoSearchOutline className='text-lg flex rounded-md text-white'/>
          </div>
          <div className='border-2 rounded-md h-8 min-w-8 flex justify-center items-center cursor-pointer'>
            <IoAdd onClick={()=>updateFriendList('add')} className='text-lg flex rounded-md text-white'/>
          </div>
        </div> */}
      </div>
      {/* onClick={()=>{setReceiver({name:item.name, image:item.image, mail:item.mail.toLowerCase()}) }} */}
      <div className='mt-4 overflow-auto scrollbar-custom h-[94%]'>
        {roomFlag &&
          roomFlag.filter((i)=>(i.isShow===true)).map((item)=>(
            <div key={item.datetime} className={`w-full px-2 cursor-pointer rounded-md bg-white flex flex-row items-center gap-3 mt-3 py-2 ${receiver.mail === item.sender || receiver.mail === item.receiver ?'bg-[#f1f5f9]':'hover:bg-slate-100'}`} onClick={()=>receiverInfo(item)} >
              {item.receiver === userInfo.current.mail
                ? friendInfo.find((i) => i.mail === item.sender)?.image
                  ? <img src={friendInfo.find((i) => i.mail === item.sender)?.image} className="w-12 rounded-full" />
                  : (
                    <div className="flex flex-col">
                      {/* 第一排一個圖片 */}
                      <div className="flex justify-center">
                        <img src={userInfo.current.image} className="w-6 h-6 rounded-full" />
                      </div>
                      {/* 第二排兩個圖片 */}
                      <div className="flex justify-center gap-1 mt-1">
                        <img src={friendInfo.filter((i) => i.groupList.some((i) => i.split('%')[0] === item.sender))[0]?.image || 'https://i.postimg.cc/rzBzgkQL/360-F-65772719-A1-UV5k-Li5n-CEWI0-BNLLi-Fa-BPEk-Ubv5-Fv.jpg'} className="w-6 h-6 rounded-full" />
                        <img src={friendInfo.filter((i) => i.groupList.some((i) => i.split('%')[0] === item.sender))[1]?.image || 'https://i.postimg.cc/rzBzgkQL/360-F-65772719-A1-UV5k-Li5n-CEWI0-BNLLi-Fa-BPEk-Ubv5-Fv.jpg'} className="w-6 h-6 rounded-full" />
                      </div>
                    </div>
                    )
                    : friendInfo.find((i) => i.mail === item.receiver)?.image
                      ? <img src={friendInfo.find((i) => i.mail === item.receiver)?.image} className="w-12 rounded-full" />
                      : (
                      <div className="flex flex-col">
                        {/* 第一排一個圖片 */}
                        <div className="flex justify-center">
                          <img src={userInfo.current.image} className="w-6 h-6 rounded-full" />
                        </div>
                        {/* 第二排兩個圖片 */}
                        <div className="flex justify-center gap-1 mt-1">
                          <img src={friendInfo.filter((i) => i.groupList.some((i) => i.split('%')[0] === item.receiver))[0]?.image || 'https://i.postimg.cc/rzBzgkQL/360-F-65772719-A1-UV5k-Li5n-CEWI0-BNLLi-Fa-BPEk-Ubv5-Fv.jpg'} className="w-6 h-6 rounded-full" />
                          <img src={friendInfo.filter((i) => i.groupList.some((i) => i.split('%')[0] === item.receiver))[1]?.image || 'https://i.postimg.cc/rzBzgkQL/360-F-65772719-A1-UV5k-Li5n-CEWI0-BNLLi-Fa-BPEk-Ubv5-Fv.jpg'} className="w-6 h-6 rounded-full" />
                        </div>
                      </div>
                      )
                  }

              <div className='flex flex-col w-full pr-2'>
                <div className='flex flex-row justify-between items-center'>
                <p className='font-bold'>
                {item.receiver === userInfo.current.mail
                  ? friendInfo.find((i) => i.mail === item.sender)?.name 
                    || userInfo.current.groupList.find((g) => typeof g === "string" && g.split('%')[0] == item.sender)?.split('%')[1] 
                    || "Unknown"
                  : friendInfo.find((i) => i.mail === item.receiver)?.name 
                    || userInfo.current.groupList.find((g) => typeof g === "string" && g.split('%')[0] == item.receiver)?.split('%')[1] 
                    || "Unknown"}
                </p>
                  <p className='text-xs text-gray-600'>{new Date(item.datetime).toLocaleDateString()}</p>
                </div>
                <p className='text-xs mt-2'>{item.msg}</p>
              </div>
            </div>
          ))
        }
      </div>
      <div className={`fixed inset-0 bg-gray-300 bg-opacity-50 transition-opacity duration-300 z-10
        ${addGroup ? "opacity-100 visible" : "opacity-0 invisible"}`}>
      </div>
      {addGroup?     
        <div className="fixed top-1/2 left-1/2 w-96 h-fit min-h-80 bg-white transform -translate-x-1/2 -translate-y-1/2 shadow-lg p-4 z-20 rounded-lg">
          <button onClick={()=>setAddGroup(false)}>close</button>
          <div>
            <h1 className='text-xl font-extrabold'>Create a group chat</h1>
            <p className='text-xs mt-2 text-gray-500 font-normal'>Create a chat with more than 2 people.</p>
          </div>
          <div className='flex flex-col gap-6 mt-8'>
            <div>
              <p>Name</p>
              <input type='text' value={groupName} onChange={(e)=>setGroupName(e.target.value)} className='border-[1px] border-gray-300 rounded-md w-full h-8 mt-3'></input>
            </div>
            <div>
              <p>Members</p>
              <Select 
                  closeMenuOnSelect={false} 
                  defaultValue={[options[4], options[5]]} 
                  isMulti 
                  options={options} 
                  onChange={handleChange} // 當選擇變更時，調用 handleChange
                  value={selectedOptions}
              />
            </div>
          </div>
          <hr className='w-full mt-12'/>
          <div className='mt-4 flex gap-4 justify-end'>
            <button className='py-1 px-2 bg-slate-200 rounded-md' onClick={()=>{setAddGroup(false); setSelectedOptions([]); setGroupName('')}}>Cancel</button>
            <button className='py-1 px-2 bg-sky-400 text-white rounded-md' onClick={()=>createGroup()}>Create</button>
          </div>
        </div>:''
      }
    </div>
  )
}

export default Sidebar