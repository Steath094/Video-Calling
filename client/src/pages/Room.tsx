import { useCallback, useEffect, useState } from "react";
import { useSocket } from "../providers/Socket";
import { usePeer } from "../providers/Peer";
import ReactPlayer from 'react-player';
function Room() {
  const socket = useSocket();
  const peerContext = usePeer();
  const peer = peerContext?.peer!;
  const createOffer = peerContext?.createOffer!;
  const createAnswer = peerContext?.createAnswer!;
  const setRemoteAnswer = peerContext?.setRemoteAnswer!;
  const sendStream = peerContext?.sendStream!;
  const remoteStream = peerContext?.remoteStream!;

  const [myStream, setMyStream] = useState<MediaStream>();
  const [remoteEmailId,setRemoteEmailId] = useState();

  const handleNewUserJoined = useCallback(
    async (data: any) => {
      const { emailId } = data;
      console.log("New User Joined Room: ", emailId);
      if (createOffer) {
        const offer = await createOffer();
        socket?.emit("call-user", { emailId, offer });
        setRemoteEmailId(emailId);
        console.log('New User Call: ',remoteEmailId);
      } else {
        console.error("createOffer is undefined");
      }
    },
    [createOffer, socket]
  );

  const handleIncomingCall = useCallback(
    async (data: any) => {
        console.log("call coming");
        
      const { from, offer } = data;
      console.log("Incoming Call From", from, offer);
      let ans;
      if (createAnswer) {
        ans = await createAnswer(offer);
        socket?.emit("call-accepted", { emailId: from, ans });
        setRemoteEmailId(from)
        console.log('Incoming Call: ',remoteEmailId);
        
      } else {
        console.error("createAnswer is undefined");
      }
    },
    [createAnswer, socket]
  );
  const handleCallAccepted = useCallback(async (data: any) => {
    const { ans } = data;
    if (setRemoteAnswer) {
      console.log("call got accepted", ans);

      await setRemoteAnswer(ans);
    } else console.error("SetRemoteAnswer function is undefined");
  }, []);
  const getUserMediaStream = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
    
  }, [sendStream]);
  useEffect(() => {
    if (!socket) return;

    socket.on("user-joined", handleNewUserJoined);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-accepted", handleCallAccepted);

    return () => {
      socket.off("user-joined", handleNewUserJoined);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-accepted", handleCallAccepted);
    };
  }, [handleNewUserJoined, handleIncomingCall, handleCallAccepted, socket]);
  const handleNegotiation = useCallback(()=>{
    const localOffer = peer?.localDescription;
    socket?.emit('call-user',{emailId: remoteEmailId,offer: localOffer})
    },[])
  useEffect(()=>{
        peer.addEventListener('negotiationneeded',handleNegotiation)
        return ()=>{
            peer.removeEventListener('negotiationneeded',handleNegotiation)
        }
  },[handleNegotiation])
  useEffect(() => {
    getUserMediaStream();
    return () => {};
  }, [getUserMediaStream]);
  const videoRef = useCallback((node: HTMLVideoElement | null) => {
    if (node && myStream) {
      node.srcObject = myStream;
    }
  }, [myStream]);

  return (
    <div>
      <h1>Room Page: {}</h1>
      <h2>You are Connected To: {remoteEmailId}</h2>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: "400px", height: "300px", background: "#000" }}
      />
      <video
        ref={node => {
          if (node && remoteStream) {
            node.srcObject = remoteStream;
          }
        }}
        autoPlay
        playsInline
        style={{ width: "400px", height: "300px", background: "#000" }}
      />
      <button className="bg-neutral-900 text-white p-4 w-md rounded-full m-4" onClick={e =>sendStream(myStream!)}>Send My Video</button>
    </div>
  );
}

export default Room;
