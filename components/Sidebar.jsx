'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast';
import { MdOutlineGroupAdd } from "react-icons/md";
import Select from 'react-select'
import { RiDeleteBin5Line } from "react-icons/ri";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { IoCloseOutline } from "react-icons/io5";
import { IoPersonAddSharp } from "react-icons/io5";
import { MdEdit } from "react-icons/md";
import { MdPersonRemoveAlt1 } from "react-icons/md";
import { IoReturnUpBackOutline } from "react-icons/io5";
import { AiOutlineWechat } from "react-icons/ai";
import { IoSearchOutline } from "react-icons/io5";
import { RxExit } from "react-icons/rx";
import { GoPersonAdd } from "react-icons/go";

const Sidebar = ({groupName, setGroupName, userInfo, socket, setReceiver, receiver, friendInfo, setFriendInfo, setSwitchTo, swithTo, messages, groupMember, setGroupMember, isProfileEdit, setIsProfileEdit, setUserImage, setMessages, setIsOpenMessageRoom}) => {
  const [addGroup, setAddGroup] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [addFriend, setAddFriend] = useState(false)
  const [image, setImage] = useState(null)
  const [isShowMore, setIsShowMore] = useState(false)
  const [isRemoveCheck, setIsRemoveCheck] = useState(false)
  const [searchTerm, setSearhTerm] = useState('')
  const [isInvite, setIsInvite] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [isSlideIn, setIsSlideIn] = useState(false)

  // 處理選擇變更
  const handleChange = (selected) => {
      setSelectedOptions(selected);
  };

  const changeGroupName = () => {

    const updatedGroupMember = groupMember.map(member => ({
      ...member,
      groupList: member.groupList.map(item => 
        item === receiver.mail+'%'+receiver.name+'%' ? receiver.mail+'%'+groupName+'%' : item // 替換 'value2' 為 'newValue2'
      )
    }));
    socket.emit('edit-groupName', { member: JSON.stringify(updatedGroupMember), groupname: groupName });
  }

  const addAFriend = async(type) => {
    if(type==='add'){
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
    }else{
      socket.emit('delete_friend', { friend: receiver.mail, adder: userInfo.current.mail, deleteOrAdd: 'remove' });
    }
  }

  const optionsData = useMemo(() => {
    return isInvite
      ? friendInfo.filter((item) => !groupMember.some((i) => i.mail === item.mail))
      : friendInfo;
  }, [friendInfo, groupMember, isInvite]);

  const options = optionsData.map(option => ({
      value: option.mail, 
      label: option.mail 
  }));

  const createGroup = async(type) => {

    let groupMember = []
    if(type==='create'){
      let group_id = Date.now()

      for(let i=0; i<selectedOptions.length; i++) {
        groupMember.push(selectedOptions[i].value)
      }

      groupMember.push(userInfo.current.mail)
      socket.emit('create_group', { group_member: JSON.stringify(groupMember), group_id: group_id + '%' + groupName + '%' });
    }else{

      for(let i=0; i<selectedOptions.length; i++) {
        groupMember.push(selectedOptions[i].value)
      }

      socket.emit('create_group', { group_member: JSON.stringify(groupMember), group_id: receiver.mail + '%' + receiver.name + '%' });
    }
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
    setIsInvite(false)
    });

    socket.on('friend_added', (msg) => {
      if(!msg.msgData){
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
          if(!isShowMore){
            setSwitchTo('Messages')
          }
        }
      }
      setAddFriend(false)
      setGroupName('')
    });

    socket.on('friend_remove', (msg) => {

      for(let i =0; i<msg.msgData.length; i++){
        if (msg.msgData[i].mail === userInfo.current.mail) {
          userInfo.current = msg.msgData[i]
          setReceiver({
            name: '',
            mail: '',
            image: '',
          })
        } 
        else {
          setFriendInfo((prev) => prev.filter((item) => item.mail !== msg.msgData[i].mail));
        }
      }
    });

    socket.on('groupName_change', (msg) => {

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
      
      setReceiver(prev => ({
        ...prev,
        name: msg.groupname,
      }));
      setIsEdit(false)
      setGroupName('')
    });

    socket.on('profile_changed', (msg) => {

      if (msg.msgData.mail === userInfo.current.mail) {
        userInfo.current = msg.msgData
        setUserImage(userInfo.current.image)
      } 
      else {
        setFriendInfo((prev) => {
          return prev.map((item) => {
              return item.mail === msg.msgData.mail ? msg.msgData : item;
          });
      });
      }
      setIsProfileEdit(false)
      setGroupName('')
    });

    socket.on('exit_done', (msg) => {
          
      if (msg.msgData.account.mail === userInfo.current.mail) {
          userInfo.current = msg.msgData.account;
          setReceiver({ name: '', mail: '', image: '' });
      } else {
          setFriendInfo((prev) => {
              return prev.map((item) => {
                  return item.mail === msg.msgData.account.mail ? msg.msgData.account : item;
              });
          });
      }
      if(msg.msgData.member_left==='1'){
          setMessages((prev)=>{
              return prev.filter((item)=>(
                  item.receiver !== msg.msgData.group_id && item.sender !== msg.msgData.group_id
              ))
          })
        }

      setIsRemoveCheck(false)
      setGroupMember((prev)=>{
        return prev.filter((item)=>(
            item.mail !== msg.msgData.account.mail
        ))
      })
  });

    return () => {
        socket.off('group_created')
        socket.off('friend_added')
        socket.off('friend_remove')
        socket.off('exit_done')
    }
  },[])

  const convertedArr2 = userInfo.current.groupList.map(item => {
    const [mail, name] = item.split('%');
    return { name, mail, image: '' }; 
  });
  
  // 合併兩個陣列 
  const result = useMemo(() => [...convertedArr2, ...friendInfo], [convertedArr2, friendInfo]);

  const filteredResult = searchTerm
  ? result.filter(item => item.name.toLowerCase().startsWith(searchTerm.toLowerCase()))
  : result;

  const chatRecord = new Set();

  const roomFlag = messages
    .sort((a, b) => b.datetime - a.datetime) 
    .filter((item) => {
      const receiver = String(item.receiver); 
      const sender = String(item.sender); 
  
      return (
        (receiver.toLowerCase() === userInfo.current.mail.toLowerCase() && sender.includes('@') ) ||
        (sender.toLowerCase() === userInfo.current.mail.toLowerCase() && receiver.includes('@') )  ||
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

  const prevInfoRef = useRef(null);

  const receiverInfo = async (info) => {
    if (!info || (prevInfoRef.current && JSON.stringify(prevInfoRef.current) === JSON.stringify(info))) {
      return;
    }

    prevInfoRef.current = info;

    // sender is group
    if ((info.sender && !info.sender.includes('@')) || (info.mail && !info.mail.includes('@'))) {
      const matchedGroup = userInfo.current.groupList.find(
        (i) => i.split('%')[0] === info.sender || i.split('%')[0] === info.mail
      );

      if (!matchedGroup) return; // Ensure matchedGroup exists

      const group_id = info.sender
        ? info.sender + '%' + matchedGroup.split('%')[1] + '%'
        : info.mail + '%' + info.name + '%';

      const formData = new FormData();
      formData.append('group_id', group_id);

      const { data } = await axios.post('https://server-chat-app-iu9t.onrender.com/api/user/get-member', formData);

      if (data.success) {
        setGroupMember(data.message);
      }
      setReceiver({
        name: matchedGroup.split('%')[1],
        mail: info.sender || info.mail,
      });

    // receiver is group
    } else if (info.receiver && !info.receiver.includes('@')) {
      const matchedGroup = userInfo.current.groupList.find((i) => i.split('%')[0] === info.receiver);

      if (!matchedGroup) return; // Ensure matchedGroup exists

      const group_id = info.receiver
        ? info.receiver + '%' + matchedGroup.split('%')[1] + '%'
        : info.mail + '%' + info.name + '%';

      const formData = new FormData();
      formData.append('group_id', group_id);

      const { data } = await axios.post('https://server-chat-app-iu9t.onrender.com/api/user/get-member', formData);

      if (data.success) {
        setGroupMember(data.message);
      }
      setReceiver({
        name: matchedGroup.split('%')[1],
        mail: info.receiver || info.mail,
      });

    // receiver is friend
    } else if (
      (info.sender && info.sender.toLowerCase() === userInfo.current.mail.toLowerCase()) ||
      (info.mail && info.mail.includes('@'))
    ) {
      const select =
        friendInfo.find((item) => item.mail === info.receiver || item.mail === info.mail) || info.receiver;

      if (!select) return; // Ensure select exists

      setReceiver({
        name: select.name,
        image: select.image,
        mail: info.receiver || info.mail,
      });

    } else if (info.receiver && info.receiver.toLowerCase() === userInfo.current.mail.toLowerCase()) {
      const select = friendInfo.find((item) => item.mail === info.sender || item.mail === info.mail);

      if (!select) return; // Ensure select exists

      setReceiver({
        name: select.name,
        image: select.image,
        mail: info.sender || info.mail,
      });
    }
  };


  const quitGroup = async() => {
    socket.emit('exit_group', { group_member: userInfo.current.mail, group_id: receiver.mail + '%' + receiver.name + '%', member_left: groupMember.length });
  }

  const removePeople = async(group_name, group_id) => {
    socket.emit('exit_group', { group_member: group_name, group_id: group_id + '%' + receiver.name + '%', member_left: groupMember.length });
  }

  const chatWithFriend = () => {
    setSwitchTo('Messages')
  }

  const changeProfile = async() => {
    if(image===null) {
      setIsProfileEdit(false)
      return
    }
    socket.emit('edit_profile', { user_mail: userInfo.current.mail, user_name: groupName, file: image });
  }

  return friendInfo && (
    <div className='bg-white h-[100vh] w-full p-4 border-r-[1px]'>
      <div className='sticky h-[6%]'>
        <div className='flex flex-row w-full justify-between items-center'>
          <p className='font-extrabold text-[25px]'>{swithTo}</p>
          {swithTo==='Messages'?
          <div className='p-2 bg-slate-100 rounded-full cursor-pointer'>
            <MdOutlineGroupAdd className='text-lg' onClick={()=>setAddGroup(true)}/>
          </div>:
          <div className='flex flex-row gap-3'>
            <div className='p-2 bg-slate-100 rounded-full cursor-pointer'>
              <IoPersonAddSharp className='text-lg' onClick={()=>setAddFriend(true)}/>
            </div>
            <div className='flex md:hidden p-2 bg-slate-100 rounded-full cursor-pointer'>
              <IoSearchOutline onClick={()=>{setIsSlideIn(true); setReceiver({name:'',image:'',mail:''});}}/>
            </div>
          </div>
          }
        </div>
      </div>
      <div className='mt-4 bg-white overflow-scroll h-[81%] md:h-[94%]'>
        {roomFlag &&
          (swithTo === 'Messages' ? roomFlag.filter((i) => i.isShow === true) : filteredResult)?.map((item)=>(
            <div key={item.datetime ?? item.mail}
                className={`w-full px-2 cursor-pointer rounded-md flex flex-row items-center gap-3 mt-3 py-2 ${
                  ([item?.sender, item?.receiver, item?.mail].includes(receiver?.mail) && 
                  (!(receiver?.mail.includes('@')) || 
                  (item?.sender && item?.receiver && item?.sender.includes('@') && item?.receiver.includes('@')) || item?.mail
                )
              ) ? '' : 'hover:bg-gray-100'
              }`}
              style={{
                backgroundColor: ([item?.sender, item?.receiver, item?.mail].includes(receiver?.mail) &&
                (!(receiver?.mail.includes('@')) || 
                (item?.sender && item?.receiver && item?.sender.includes('@') && item?.receiver.includes('@')) || item?.mail
              )
                ) ? '#f1f5f9' : ''
              }}
              onClick={() => {receiverInfo(item); setIsShowMore(false); setIsOpenMessageRoom(swithTo==='Messages'? true:!isSlideIn &&　window.innerWidth < 768  ?setIsSlideIn(true):'')}}>
              {swithTo==='People' && item && item.mail.includes('@')? <img src={item.image} className="w-12 h-12 object-cover rounded-full" />
              :(item? item.receiver: null) === userInfo.current.mail
                ? friendInfo.find((i) => i.mail === (item? item.sender: null))?.image
                  ? <img src={friendInfo.find((i) => i.mail === (item? item.sender: null))?.image} className="w-12 h-12 object-cover rounded-full" />
                  : (
                    <div className="flex flex-col">
                      {/* 第一排一個圖片 */}
                      <div className="flex justify-center">
                        <img src={userInfo.current.image} className="w-6 h-6 object-cover rounded-full" />
                      </div>
                      {/* 第二排兩個圖片 */}
                      <div className="flex justify-center gap-1 mt-1">
                        <img src={friendInfo.filter((i) => i.groupList.some((i) => i.split('%')[0] === (item ? item.sender : null) || i.split('%')[0] === (item ? item.mail : null)))[0]?.image || 'https://i.postimg.cc/rzBzgkQL/360-F-65772719-A1-UV5k-Li5n-CEWI0-BNLLi-Fa-BPEk-Ubv5-Fv.jpg'} className="w-6 h-6 object-cover rounded-full" />
                        <img src={friendInfo.filter((i) => i.groupList.some((i) => i.split('%')[0] === (item ? item.sender : null) || i.split('%')[0] === (item ? item.mail : null)))[1]?.image || 'https://i.postimg.cc/rzBzgkQL/360-F-65772719-A1-UV5k-Li5n-CEWI0-BNLLi-Fa-BPEk-Ubv5-Fv.jpg'} className="w-6 h-6 object-cover rounded-full" />
                      </div>
                    </div>
                    )
                    : friendInfo.find((i) => i.mail === (item ? item.receiver : null))?.image
                      ? <img src={friendInfo.find((i) => i.mail === (item ? item.receiver : null))?.image} className="w-12 h-12 object-cover rounded-full" />
                      : (
                      <div className="flex flex-col">
                        {/* 第一排一個圖片 */}
                        <div className="flex justify-center">
                          <img src={userInfo.current.image} className="w-6 h-6 object-cover rounded-full" />
                        </div>
                        {/* 第二排兩個圖片 */}
                        <div className="flex justify-center gap-1 mt-1">
                          <img src={friendInfo.filter((i) => i.groupList.some((i) => i.split('%')[0] === (item ? item.receiver : null) || i.split('%')[0] === (item ? item.mail : null)))[0]?.image || 'https://i.postimg.cc/rzBzgkQL/360-F-65772719-A1-UV5k-Li5n-CEWI0-BNLLi-Fa-BPEk-Ubv5-Fv.jpg'} className="w-6 h-6 object-cover rounded-full" />
                          <img src={friendInfo.filter((i) => i.groupList.some((i) => i.split('%')[0] === (item ? item.receiver : null) || i.split('%')[0] === (item ? item.mail : null)))[1]?.image || 'https://i.postimg.cc/rzBzgkQL/360-F-65772719-A1-UV5k-Li5n-CEWI0-BNLLi-Fa-BPEk-Ubv5-Fv.jpg'} className="w-6 h-6 object-cover rounded-full" />
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
                {swithTo==='People'?'':<p className='text-xs mt-2'>{item.msg.slice(0,50)}{item.msg.length>50?'...':''}</p>}
              </div>
            </div>
          ))
        }
      </div>
      <div className={`fixed inset-0 bg-gray-300 bg-opacity-50 transition-opacity duration-300
        ${addGroup || addFriend || isProfileEdit || isRemoveCheck || isInvite || isEdit || isSlideIn ? "opacity-100 visible z-40" : "opacity-0 invisible z-10"}`} onClick={()=>setIsSlideIn(false)}>
      </div>
      <div className={`fixed right-0 top-0 rounded-l-3xl md:rounded-none bg-white flex flex-col p-4 w-[85%] md:w-[70%] h-[100vh] min-w-[250px] gap-2 
            shadow-lg z-30
            transform transition-transform duration-[700ms] ease-in-out
            ${isInvite || isRemoveCheck?'z-20':isSlideIn?'z-50':window.innerWidth >= 768  
                ? (swithTo === 'People' && receiver !== null ? "translate-x-0" : "translate-x-full")
                : (isSlideIn ? "translate-x-0" : "translate-x-full")}`}>
        <div className="w-full h-full flex flex-col justify-center items-center relative">
            {receiver.mail.length>0?<div className='flex flex-col gap-2 justify-center items-center'>
              {!receiver.mail?.includes('@') || false ? <div className={`flex ${groupMember.length>2?'flex-col': 'flex-row'} gap-2 justify-center items-center`}>
                {groupMember.slice(0,1).map((i)=>(
                    <img key={i.image} src={i.image} loading="lazy" className='rounded-full w-16 h-16 object-cover'></img>
                ))}
                <div className='flex flex-row gap-2'>
                  {groupMember.slice(1,3).map((i)=>(
                      <img key={i.image} src={i.image} loading="lazy" className='rounded-full w-16 h-16 object-cover'></img>
                  ))}
                </div>
              </div>:''}
              {receiver.mail?.includes('@') ? <img src={receiver.image} loading="lazy" className='rounded-full w-24 h-24 object-cover'></img>:''}
              
              <h1 className="mt-4 font-bold text-lg flex items-center gap-2">{ receiver.name }<span className='cursor-pointer' onClick={()=>{setIsEdit(true); setGroupName(receiver.name)}}>{receiver.mail?.includes('@') ? '':<MdEdit />}</span></h1>
              {!receiver.mail?.includes('@') ?<div className='flex flex-row gap-2 items-center'>
                        <p className='text-xs text-gray-500'>{groupMember.length} members</p>
                        <p className='px-3 bg-slate-100 cursor-pointer rounded-full' onClick={() => setIsShowMore(true)}>&gt;</p>
                    </div>:''}
              <div className='flex flex-row gap-6 mt-12 items-center'>
              <div className='flex flex-col gap-3 justify-center items-center'>
                  <div className='p-4 bg-slate-100 rounded-full cursor-pointer' onClick={()=>{chatWithFriend(); setIsOpenMessageRoom(true); setIsSlideIn(false);}}>
                          <IoChatboxEllipsesOutline className='w-5 h-5'/>
                      </div>
                      <p className='text-gray-600'>Chat</p>
                  </div>
                  {!receiver.mail?.includes('@') ?
                  <div className='flex flex-col gap-3 justify-center items-center' onClick={()=> setIsInvite(true)}>
                      <div className='p-4 bg-slate-100 rounded-full cursor-pointer'>
                          <GoPersonAdd className='w-5 h-5'/>
                      </div>
                      <p className='text-gray-600'>Invite</p>
                  </div>:''
                  }
                  {!receiver.mail?.includes('@') ?
                  <div className='flex flex-col gap-3 justify-center items-center' onClick={()=> quitGroup()}>
                      <div className='p-4 bg-slate-100 rounded-full cursor-pointer'>
                          <RxExit className='w-5 h-5'/>
                      </div>
                      <p className='text-gray-600'>Exit</p>
                  </div>:
                  <div className='flex flex-col gap-3 justify-center items-center' onClick={()=> addAFriend('delete')}>
                    <div className='p-4 bg-slate-100 rounded-full cursor-pointer'>
                        <RiDeleteBin5Line className='w-5 h-5'/>
                    </div>
                    <p className='text-gray-600'>Delete</p>
                  </div>
                  }
              </div>
            </div>:
            <div className='flex justify-center items-center flex-col w-full'>
              <AiOutlineWechat className='text-[120px] text-sky-500 mb-4'/>
              <div className="relative">
                <input 
                  type="text" 
                  className="border border-gray-300 rounded-sm pl-3 pr-10 py-2 w-full"
                  placeholder="Search by name..." value={searchTerm} onChange={(e)=>setSearhTerm(e.target.value)}
                />
                <div className="absolute top-1/2 right-2 -translate-y-1/2 bg-sky-500 rounded-sm p-2">
                  <IoSearchOutline className="text-white" />
                </div>
              </div>
            </div>
          }
        </div>
        {/* show more */}
        <div 
            className={`fixed right-0 top-0 bg-white rounded-l-3xl md:rounded-none flex flex-col p-4 w-full h-[100vh] gap-2 
                transform transition-transform duration-[700ms] ease-in-out shadow-lg
                ${isShowMore ? "translate-x-0" : "translate-x-full"}`}>
            <div className="w-full h-full flex flex-col justify-center items-center relative">
                <div className='mt-1 w-full flex flex-row justify-between pr-4 pl-1'>
                  <p className='font-extrabold text-2xl'>{`${receiver.name} (${groupMember.length})`}</p>
                  <button onClick={() => setIsShowMore(false)} className="border-[1px] border-black px-2 py-1 rounded">
                    <IoReturnUpBackOutline />
                  </button>
                </div>
                <div className='flex flex-col gap-2 pr-4 justify-start w-full h-full mt-4 items-start overflow-scroll'>
                    {groupMember && groupMember.map((item)=>(
                      <div key={item.image} className='flex flex-row justify-between items-center w-full hover:bg-slate-100 p-2 rounded-md'>
                        <div className='flex flex-row gap-3 md:gap-6 justify-center items-center'>
                          <img src={item.image} loading="lazy" className='w-12 h-12 md:w-16 md:h-16 object-cover rounded-full'></img>
                          <p className='text-sm md:text-normal'>{item.name}</p>
                        </div>
                        {item.mail!==userInfo.current.mail?<div className='flex flex-col text-sm md:text-normal md:flex-row gap-4'>
                            <div className='flex flex-row text-xs md:text-normal gap-2 px-2 py-1 cursor-pointer hover:font-bold hover:text-red-600 bg-slate-50 items-center' onClick={()=>setIsRemoveCheck([item.mail, item.name])}>
                              <MdPersonRemoveAlt1 className='text-[17px] md:text-[22px]'/>
                              <hr className='h-full'/>
                              <p>Remove</p>
                            </div>
                            {!userInfo.current.friendList.includes(item.mail)?
                            <div className='flex flex-row text-xs md:text-normal gap-2 px-2 py-1 cursor-pointer hover:font-bold hover:text-green-600 bg-slate-50 items-center' onClick={()=>{setGroupName(item.mail); addAFriend('add')}}>
                              <IoPersonAddSharp className='text-[12px] md:text-[17px]'/>
                              <hr className='h-full'/>
                              <p>Add Friend</p>
                            </div>:
                            <div className='flex flex-row text-xs md:text-normal gap-2 px-2 py-1 cursor-pointer hover:font-bold hover:text-green-600 bg-slate-50 items-center' 
                              onClick={()=>{
                                setReceiver({
                                  name: item.name,
                                  image: item.image,
                                  mail: item.mail
                                })
                                setSwitchTo('Messages')
                                setIsShowMore(false)
                                setIsSlideIn(false)
                                setIsOpenMessageRoom(true)
                              }}>
                              <IoChatboxEllipsesOutline className='text-[12px] md:text-[17px]'/>
                              <hr className='h-full'/>
                              <p>Chat</p>
                            </div>
                            }
                        </div>:<p className='px-2 py-1 rounded-full text-xs border-[1px] text-green-500 border-green-500'>YOU</p>
                        }
                      </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
      {addGroup || addFriend || isProfileEdit || isRemoveCheck || isInvite || isEdit ?     
        <div className="fixed top-1/2 left-1/2 w-96 h-fit min-h-80 bg-white transform -translate-x-1/2 -translate-y-1/2 shadow-lg p-4 rounded-lg z-50">
          <button onClick={()=>{setAddGroup(false); setSelectedOptions([]); setGroupName(''); setAddFriend(false); setIsProfileEdit(false); setIsRemoveCheck(false); setIsInvite(false); setIsEdit(false)}} className='flex justify-end w-full'><IoCloseOutline /></button>
          <div>
            <h1 className='text-xl font-extrabold'>{isEdit?'Edit group name':isInvite?'Invite Friend':isRemoveCheck?'Edit Member':isProfileEdit?'Profile':swithTo==='Messages'?'Create a group chat':'Add a friend'}</h1>
            <p className='text-xs mt-2 text-gray-500 font-normal'>{isEdit?'Group name can not include %.':isInvite?'Add friends to the group by mail':isRemoveCheck?'':isProfileEdit?'Edit your public information':swithTo==='Messages'?'Create a chat with more than 2 people.':'Add a friend by mail.'}</p>
          </div>
          <div className='flex flex-col gap-6 mt-8'>
            <div>
            <p>
              {isRemoveCheck
                ? <>Are you sure you want to remove <strong>{isRemoveCheck[1]}</strong> from <strong>{receiver.name}</strong>?</>
                : isInvite ?'':(isProfileEdit || swithTo === 'Messages' || isEdit)
                  ? 'Name'
                  : 'Email'}
            </p>
              {!isRemoveCheck && !isInvite ? <input type='text' value={groupName} onChange={(e)=>setGroupName(e.target.value)} className='border-[1px] px-2 border-gray-300 rounded-md w-full h-8 mt-3'></input>:''}
            </div>
            {swithTo==='Messages' && !isProfileEdit || isInvite?<div>
              <p className='mb-4'>Members</p>
              <Select 
                  closeMenuOnSelect={false} 
                  defaultValue={[options[4], options[5]]} 
                  isMulti 
                  options={options} 
                  onChange={handleChange} 
                  value={selectedOptions} 
              />
            </div>:''}
            {isProfileEdit?
              <div>
                <p>Photo</p>
                <div className='relative w-fit'>
                  <img src={image?URL.createObjectURL(image):userInfo.current.image} loading="lazy" className='mt-4 rounded-full w-16 h-16 object-cover'></img>
                  <label htmlFor="image" className='bg-slate-50 p-1 rounded-full w-fit absolute top-[-3px] right-[-5px] cursor-pointer'>
                    <MdEdit/>
                    <input type='file' id='image'
                      onChange={(e) => setImage(e.target.files[0])}  hidden>
                    </input>
                  </label>
                </div>
              </div>:''
            }
          </div>
          <hr className='w-full mt-12'/>
          <div className='mt-4 flex gap-4 justify-end'>
            <button className='py-1 px-2 bg-slate-200 rounded-md' onClick={()=>{setAddGroup(false); setSelectedOptions([]); setGroupName(''); setAddFriend(false); setIsProfileEdit(false); setIsRemoveCheck(false); setIsInvite(false); setIsEdit(false)}}>Cancel</button>
            {isEdit?
            <button className='py-1 px-2 bg-sky-400 text-white rounded-md' onClick={()=>changeGroupName()}>Change</button>:
            isProfileEdit?
            <button className='py-1 px-2 bg-sky-400 text-white rounded-md' onClick={()=>changeProfile()}>Save</button>:
            isRemoveCheck?
            <button className='py-1 px-2 bg-red-500 text-white rounded-md' onClick={()=>removePeople(isRemoveCheck[0], receiver.mail)}>Sure</button>:
            swithTo==='Messages'?
            <button className='py-1 px-2 bg-sky-400 text-white rounded-md' onClick={()=>createGroup('create')}>Create</button>:
            isInvite?
            <button className='py-1 px-2 bg-sky-400 text-white rounded-md' onClick={()=>createGroup('invite')}>Invite</button>:
            <button className='py-1 px-2 bg-sky-400 text-white rounded-md' onClick={()=>addAFriend('add')}>Add</button>
            }
          </div>
        </div>:''
      }
    </div>
  )
}

export default Sidebar
