import { useEffect, useRef,useCallback } from 'react';
import {useSocket} from '../providers/Socket'
import { useNavigate } from 'react-router-dom';

function Home({ setMyStream }: { setMyStream: (stream: MediaStream) => void }) {
  const emailRef = useRef<HTMLInputElement>(null);
  const roomRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const socket = useSocket();
  const handleRoomJoined = useCallback( ({ roomId }: { roomId: string }) => {
    navigate(`/room/${roomId}`)
  },[navigate])
  useEffect(() => {
    socket?.on('joined-room',handleRoomJoined)
    return ()=>{
      socket?.off('joined-room',handleRoomJoined)

    }
  }, [handleRoomJoined,socket]);
  const handleJoinRoom = useCallback( async () =>{
    const emailId = emailRef.current?.value;
    const roomId = roomRef.current?.value;

    if (!emailId || !roomId) {
      alert("Please enter both email and room code.");
      return;
    }
    
    try {
      // 1. Get media stream first
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      // 2. Set the stream in the parent App component
      setMyStream(stream);
      // 3. Emit the join-room event
      socket?.emit('join-room', { emailId, roomId });
    } catch (error) {
      console.error("Failed to get media stream:", error);
      alert("Could not access camera and microphone.");
    }
  }, [socket, setMyStream]);
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