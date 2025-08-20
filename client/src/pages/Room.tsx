import { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "../providers/Socket";
import { usePeer } from "../providers/Peer";
function Room({ myStream }: { myStream: MediaStream | null }) {
  const socket = useSocket();
  const {
    peer,
    createOffer,
    createAnswer,
    setRemoteAnswer,
    sendStream,
    remoteStream,
  } = usePeer()!;

  const [remoteEmailId, setRemoteEmailId] = useState<string | null>(null);

  const myVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const handleNewUserJoined = useCallback(
    async (data: any) => {
      const { emailId } = data;
      console.log("New User Joined Room: ", emailId);
      const offer = await createOffer();
      socket?.emit("call-user", { emailId, offer });
      setRemoteEmailId(emailId);
      console.log("New User Call: ", remoteEmailId);
      if (myStream) {
        console.log("Sending my stream to new user");
        sendStream(myStream);
      }
    },
    [createOffer, socket]
  );

  const handleIncomingCall = useCallback(
    async (data: any) => {
      const { from, offer } = data;
      console.log("Incoming Call From", from, offer);
      if (createAnswer && myStream) {
        // Check for myStream
        const ans = await createAnswer(offer);
        socket?.emit("call-accepted", { emailId: from, ans });
        setRemoteEmailId(from);
        console.log("Sending my stream back to caller");
        sendStream(myStream);
      } else {
        console.error("createAnswer or myStream is not ready");
      }
    },
    [createAnswer, socket, myStream, sendStream] // Add dependencies
  );
  const handleCallAccepted = useCallback(async (data: any) => {
    const { ans } = data;
    console.log("call got accepted", ans);
    await setRemoteAnswer(ans);
    // The caller's stream is already sent in `handleNewUserJoined`
  }, [setRemoteAnswer]);
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
  
  // Removed duplicate handleNegotiationNeeded and its useEffect
  const handleNegotiation = useCallback(async ()=>{
    const localOffer = await createOffer();
    socket?.emit('call-user',{emailId: remoteEmailId,offer: localOffer})
    },[createOffer, remoteEmailId, socket])
    
  useEffect(()=>{
        peer.addEventListener('negotiationneeded',handleNegotiation)
        return ()=>{
            peer.removeEventListener('negotiationneeded',handleNegotiation)
        }
  },[handleNegotiation, peer])

  // Add listeners for the negotiation flow from the other user
  useEffect(() => {
    if (!socket) return;

    const handleNegotiationIncoming = async (data: {
      from: any;
      offer: any;
    }) => {
      const { from, offer } = data;
      const ans = await createAnswer(offer);
      socket.emit("negotiation-done", { to: from, ans });
    };

    const handleNegotiationFinal = async (data: { from: any; ans: any }) => {
      await setRemoteAnswer(data.ans);
    };

    socket.on("negotiation-needed", handleNegotiationIncoming);
    socket.on("negotiation-result", handleNegotiationFinal);

    return () => {
      socket.off("negotiation-needed", handleNegotiationIncoming);
      socket.off("negotiation-result", handleNegotiationFinal);
    };
  }, [socket, createAnswer, setRemoteAnswer]);
   useEffect(() => {
    if (myVideoRef.current && myStream) {
      console.log("Attaching my stream to my video element.");
      myVideoRef.current.srcObject = myStream;
    }
  }, [myStream]);
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      console.log("REMOTE STREAM RECEIVED, ATTACHING TO VIDEO ELEMENT.");
      console.log("Remote Stream Object:", remoteStream);
      console.log("Remote Stream Tracks:", remoteStream.getTracks());
      
      // This is the most important part:
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);
  return (
    <div>
      <h1>Room Page</h1>
      <h2>{remoteEmailId ? `You are connected to: ${remoteEmailId}` : "Waiting for another user..."}</h2>
      
      <div style={{ display: 'flex', gap: '10px' }}>
          <div>
              <h3>My Video</h3>
              {/* ✅ 5. Attach the refs to the video elements */}
              <video
                ref={myVideoRef}
                autoPlay
                playsInline
                muted
                style={{ width: "500px", height: "300px", background: "#333" }}
              />
          </div>
          <div>
              <h3>Remote Video</h3>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                style={{ width: "500px", height: "300px", background: "#333" }}
              />
          </div>
      </div>

      <button className="bg-neutral-900 text-white p-4 w-md rounded-full m-4" onClick={() => myStream && sendStream(myStream)}>
        Re-send Stream
      </button>
    </div>
  );
}

export default Room;
