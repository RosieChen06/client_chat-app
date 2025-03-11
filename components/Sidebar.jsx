'use client'
import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast';
import { MdOutlineGroupAdd } from "react-icons/md";
import Select from 'react-select'
import { RiDeleteBin5Line } from "react-icons/ri";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { IoCloseOutline } from "react-icons/io5";
import { IoPersonAddSharp } from "react-icons/io5";

const Sidebar = ({userInfo, socket, setReceiver, receiver, friendInfo, setFriendInfo, setSwitchTo, swithTo, messages, groupMember, setGroupMember}) => {
  const [addGroup, setAddGroup] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [groupName, setGroupName] = useState('')
  const [addFriend, setAddFriend] = useState(false)

  // 處理選擇變更
  const handleChange = (selected) => {
      setSelectedOptions(selected);
  };

  const addAFriend = async() => {
    if(groupName.length===0){
      return
    }else if(!groupName.includes('@')){
      toast.error('Please enter a valid email')
      return
    }else if(userInfo.current.friendList.includes(groupName.toLowerCase())){
      toast.error('Already exist')
      return
    }
    socket.emit('add_friend', { friend: groupName.toLowerCase(), adder: userInfo.current.mail, deleteOrAdd: 'add' });
  }

  const [optionsData, setOptionsData] = useState(userInfo.current.friendList);

  const options = optionsData.map(option => ({
      value: option, 
      label: option  
  }));

  const createGroup = async() => {

    let groupMember = []
    let group_id = Date.now()

    for(let i=0; i<selectedOptions.length; i++){
      groupMember.push(selectedOptions[i].value)
    }

    groupMember.push(userInfo.current.mail)
    socket.emit('create_group', { group_member: JSON.stringify(groupMember), group_id: group_id + '%' + groupName + '%' });
  }

  useEffect(()=>{

    socket.on('group_created', (msg) => {
      for(let i =0; i<msg.msgData.length; i++){
          if (msg.msgData[i].mail === userInfo.current.mail) {
            userInfo.current = msg.msgData[i]
          } 
          else {
            setFriendInfo((prev) => {
                return prev.map((item) => {
                    return item.mail === msg.msgData[i].mail ? msg.msgData[i] : item;
                });
            });
          }
      }
    setReceiver({ name: msg.group_name.split('%')[1], mail: msg.group_name.split('%')[0] })
    setGroupMember(msg.msgData)
    setAddGroup(false)
    setSelectedOptions([])
    setGroupName('')
    });

    socket.on('friend_added', (msg) => {
      if(!msg.msgData){
        console.log('dad')
        toast.error('User does not exist')
        return
      }
      for(let i =0; i<msg.msgData.length; i++){
        if (msg.msgData[i].mail === userInfo.current.mail) {
          userInfo.current = msg.msgData[i]
        } 
        else {
          setFriendInfo((prev)=>[...prev, msg.msgData[i]]);
          setReceiver({
            name: msg.msgData[i].name,
            mail: msg.msgData[i].mail,
            image: msg.msgData[i].image,
          })
          setSwitchTo('Messages')
        }
      }
      setAddFriend(false)
      setGroupName('')
    });

    return () => {
        socket.off('group_created')
        socket.off('friend_added')
    }
  },[])

  const convertedArr2 = userInfo.current.groupList.map(item => {
    const [mail, name] = item.split('%');
    return { name, mail, image: '' }; 
  });
  
  // 合併兩個陣列
  const result = [...convertedArr2, ...friendInfo];

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
      // sender is group
      console.log(info)
      if ((info.sender && !info.sender.includes('@')) || (info.mail && !info.mail.includes('@'))) {
        const matchedGroup = userInfo.current.groupList.find((i) => i.split('%')[0] === info.sender || i.split('%')[0] === info.mail);
        const group_id = info.sender? info.sender+'%' + matchedGroup.split('%')[1] + '%' : info.mail+'%' + info.name + '%'
        const formData = new FormData()
        formData.append('group_id', group_id)

        const {data} = await axios.post('http://localhost:3001/api/user/get-member',formData)
    
        if(data.success){
            setGroupMember(data.message)
        }
        setReceiver({
          name: matchedGroup.split('%')[1],
          mail: info.sender || info.mail
        })
        // receiver is group
      }else if(info.receiver && !info.receiver.includes('@')){
        const matchedGroup = userInfo.current.groupList.find((i) => i.split('%')[0] === info.receiver);
        const group_id = info.receiver? info.receiver+'%' + matchedGroup.split('%')[1] + '%' : info.mail+'%' + info.name + '%'
        const formData = new FormData()
        formData.append('group_id', group_id)

        const {data} = await axios.post('http://localhost:3001/api/user/get-member',formData)
    
        if(data.success){
            setGroupMember(data.message)
        }
        setReceiver({
          name: matchedGroup.split('%')[1],
          mail: info.receiver || info.mail
        })
      }
      else if(info.sender && info.sender.toLowerCase()===userInfo.current.mail.toLowerCase() || info.mail && info.mail.includes('@')){
        const select = friendInfo.find((item)=>(
          item.mail === info.receiver || item.mail ===info.mail
        )) || info.receiver
        setReceiver({
          name: select.name,
          image: select.image,
          mail: info.receiver || info.mail
        })
      }else if(info.receiver && info.receiver.toLowerCase()===userInfo.current.mail.toLowerCase()){
        const select = friendInfo.find((item)=>(
          item.mail===info.sender || item.mail === info.mail
        ))
        setReceiver({
            name: select.name,
            image: select.image,
            mail: info.sender || info.mail
        })
      }
  }

  const chatWithFriend = () => {
    // setReceiver({
    //   name: friendDetail.name,
    //   image: friendDetail.image,
    //   mail: friendDetail.mail
    // })
    setSwitchTo('Messages')
  }

  return friendInfo && (
    <div className='bg-white h-[100vh] p-4 border-r-[1px]'>
      <div className='sticky h-[6%]'>
        <div className='flex flex-row w-full justify-between items-center'>
          <p className='font-extrabold text-[25px]'>{swithTo}</p>
          <div className='p-2 bg-slate-100 rounded-full cursor-pointer'>
            {swithTo==='Messages'?<MdOutlineGroupAdd className='text-lg' onClick={()=>setAddGroup(true)}/>:
              <IoPersonAddSharp className='text-lg' onClick={()=>setAddFriend(true)}/>}
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
          (swithTo === 'Messages' ? roomFlag.filter((i) => i.isShow === true) : result)?.map((item)=>(
            <div key={item.datetime?item.datetime:item.mail} className={`w-full px-2 cursor-pointer rounded-md bg-white flex flex-row items-center gap-3 mt-3 py-2 ${receiver.mail === item.sender || receiver.mail === item.receiver || receiver.mail === item.mail ?'bg-gray-100':'hover:bg-gray-100'}`} onClick={()=>receiverInfo(item)} >
              {swithTo==='People' && item.mail.includes('@')? <img src={item.image} className="w-12 rounded-full" />
              :item.receiver === userInfo.current.mail
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
                        <img src={friendInfo.filter((i) => i.groupList.some((i) => i.split('%')[0] === item.sender || i.split('%')[0] === item.mail))[0]?.image || 'https://i.postimg.cc/rzBzgkQL/360-F-65772719-A1-UV5k-Li5n-CEWI0-BNLLi-Fa-BPEk-Ubv5-Fv.jpg'} className="w-6 h-6 rounded-full" />
                        <img src={friendInfo.filter((i) => i.groupList.some((i) => i.split('%')[0] === item.sender || i.split('%')[0] === item.mail))[1]?.image || 'https://i.postimg.cc/rzBzgkQL/360-F-65772719-A1-UV5k-Li5n-CEWI0-BNLLi-Fa-BPEk-Ubv5-Fv.jpg'} className="w-6 h-6 rounded-full" />
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
                          <img src={friendInfo.filter((i) => i.groupList.some((i) => i.split('%')[0] === item.receiver || i.split('%')[0] === item.mail))[0]?.image || 'https://i.postimg.cc/rzBzgkQL/360-F-65772719-A1-UV5k-Li5n-CEWI0-BNLLi-Fa-BPEk-Ubv5-Fv.jpg'} className="w-6 h-6 rounded-full" />
                          <img src={friendInfo.filter((i) => i.groupList.some((i) => i.split('%')[0] === item.receiver || i.split('%')[0] === item.mail))[1]?.image || 'https://i.postimg.cc/rzBzgkQL/360-F-65772719-A1-UV5k-Li5n-CEWI0-BNLLi-Fa-BPEk-Ubv5-Fv.jpg'} className="w-6 h-6 rounded-full" />
                        </div>
                      </div>
                      )
                  }

              <div className='flex flex-col w-full pr-2'>
                <div className='flex flex-row justify-between items-center'>
                <p className='font-bold'>
                {swithTo==='People' ? (item.name):item.receiver === userInfo.current.mail
                  ?friendInfo.find((i) => i.mail === item.sender)?.name 
                    || userInfo.current.groupList.find((g) => typeof g === "string" && g.split('%')[0] == item.sender)?.split('%')[1] 
                    || "Unknown"
                  : friendInfo.find((i) => i.mail === item.receiver)?.name 
                    || userInfo.current.groupList.find((g) => typeof g === "string" && g.split('%')[0] == item.receiver)?.split('%')[1] 
                    || "Unknown"}
                </p>
                  {swithTo==='People'?'':<p className='text-xs text-gray-600'>{new Date(item.datetime).toLocaleDateString()}</p>}
                </div>
                {swithTo==='People'?'':<p className='text-xs mt-2'>{item.msg}</p>}
              </div>
            </div>
          ))
        }
      </div>
      <div className={`fixed inset-0 bg-gray-300 bg-opacity-50 transition-opacity duration-300
        ${addGroup || addFriend ? "opacity-100 visible z-40" : "opacity-0 invisible z-10"}`} >
      </div>
      <div className={`fixed right-0 top-0 rounded-l-3xl bg-white flex flex-col p-4 w-[70%] h-[100vh] min-w-[250px] gap-2 
            transform transition-transform duration-[700ms] ease-in-out shadow-lg z-30
            ${swithTo==='People'&&receiver!==null ? "translate-x-0" : "translate-x-full"}`}>
        <div className="w-full h-full flex flex-col justify-center items-center relative">
            {receiver.mail.length>0?<div className='flex flex-col gap-2 justify-center items-center'>
              {!receiver.mail?.includes('@') || false ? <div className={`flex ${groupMember.length>2?'flex-col': 'flex-row'} gap-2 justify-center items-center`}>
                {groupMember.slice(0,1).map((i)=>(
                    <img key={i.image} src={i.image} className='rounded-full w-16'></img>
                ))}
                <div className='flex flex-row gap-2'>
                  {groupMember.slice(1,3).map((i)=>(
                      <img key={i.image} src={i.image} className='rounded-full w-16'></img>
                  ))}
                </div>
              </div>:''}
              {receiver.mail?.includes('@') ? <img src={receiver.image} className='rounded-full w-24'></img>:''}
              
              <h1 className='mt-4 font-bold text-lg'>{ receiver.name }</h1>
              <div className='flex flex-row gap-6 mt-12 items-center'>
              <div className='flex flex-col gap-3 justify-center items-center'>
                  <div className='p-4 bg-slate-100 rounded-full cursor-pointer' onClick={()=>chatWithFriend()}>
                          <IoChatboxEllipsesOutline className='w-5 h-5'/>
                      </div>
                      <p className='text-gray-600'>Chat</p>
                  </div>
                  <div className='flex flex-col gap-3 justify-center items-center'>
                      <div className='p-4 bg-slate-100 rounded-full cursor-pointer'>
                          <RiDeleteBin5Line className='w-5 h-5'/>
                      </div>
                      <p className='text-gray-600'>Delete</p>
                  </div>
              </div>
              <p></p>
            </div>:'find a friend to chat with!'}
            {/* <button className="absolute top-4 right-4 border-2 border-black text-black text-lg p-1 rounded">
                <IoCloseOutline />
            </button> */}
        </div>
    </div>
      {addGroup || addFriend?     
        <div className="fixed top-1/2 left-1/2 w-96 h-fit min-h-80 bg-white transform -translate-x-1/2 -translate-y-1/2 shadow-lg p-4 z-20 rounded-lg z-50">
          <button onClick={()=>{setAddGroup(false); setSelectedOptions([]); setGroupName(''); setAddFriend(false)}} className='flex justify-end w-full'><IoCloseOutline /></button>
          <div>
            <h1 className='text-xl font-extrabold'>{swithTo==='Messages'?'Create a group chat':'Add a friend'}</h1>
            <p className='text-xs mt-2 text-gray-500 font-normal'>{swithTo==='Messages'?'Create a chat with more than 2 people.':'Add a friend by mail.'}</p>
          </div>
          <div className='flex flex-col gap-6 mt-8'>
            <div>
              <p>{swithTo==='Messages'?'Name':'Email'}</p>
              <input type='text' value={groupName} onChange={(e)=>setGroupName(e.target.value)} className='border-[1px] px-2 border-gray-300 rounded-md w-full h-8 mt-3'></input>
            </div>
            {swithTo==='Messages'?<div>
              <p>Members</p>
              <Select 
                  closeMenuOnSelect={false} 
                  defaultValue={[options[4], options[5]]} 
                  isMulti 
                  options={options} 
                  onChange={handleChange} // 當選擇變更時，調用 handleChange
                  value={selectedOptions}
              />
            </div>:''}
          </div>
          <hr className='w-full mt-12'/>
          <div className='mt-4 flex gap-4 justify-end'>
            <button className='py-1 px-2 bg-slate-200 rounded-md' onClick={()=>{setAddGroup(false); setSelectedOptions([]); setGroupName(''); setAddFriend(false)}}>Cancel</button>
            {swithTo==='Messages'?
            <button className='py-1 px-2 bg-sky-400 text-white rounded-md' onClick={()=>createGroup()}>Create</button>:
            <button className='py-1 px-2 bg-sky-400 text-white rounded-md' onClick={()=>addAFriend()}>Add</button>}
          </div>
        </div>:''
      }
    </div>
  )
}

export default Sidebar