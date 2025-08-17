import { useEffect, useRef,useCallback } from 'react';
import {useSocket} from '../providers/Socket'
import { useNavigate } from 'react-router-dom';

function Home() {
  const emailRef = useRef<HTMLInputElement>(null);
  const roomRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const socket = useSocket();
  const handleRoomJoined = ({ roomId }: { roomId: string }) => {
    navigate(`/room/${roomId}`)
  }
  useEffect(() => {
    socket?.on('joined-room',handleRoomJoined)
    return ()=>{
      socket?.off('joined-room',handleRoomJoined)

    }
  }, [handleRoomJoined,socket]);
  const handleJoinRoom = useCallback( () =>{
    console.log(emailRef.current?.value);
    console.log(roomRef.current?.value);
    
    socket?.emit('join-room',{emailId: emailRef.current?.value,roomId:roomRef.current?.value})
  },[])
  return (
    <div className="w-screen h-screen flex justify-center items-center ">
        <div className="flex flex-col h-screen justify-center items-center gap-4 ">
            <input ref={emailRef} className="p-4 border border-neutral-400 rounded-2xl" type="email" name="userMail" id="userMail" placeholder="Enter Yuor Mail Here" />
            <input ref={roomRef} className="p-4 border border-neutral-400 rounded-2xl" type="text" name="roomId" id="roomId" placeholder="Enter Room Code" />
            <button   onClick={handleJoinRoom} className="bg-neutral-400 text-2xl p-3 w-fit rounded-md hover:bg-gray-700 text-white">Enter Room</button>
        </div>
    </div>
  )
}

export default Home