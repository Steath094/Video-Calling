import React, { useCallback, useEffect, useState } from "react";
import { useMemo } from "react";
interface PeerContextType {
    peer: RTCPeerConnection;
    createOffer: () => Promise<RTCSessionDescriptionInit>;
    createAnswer: (offer:any) => Promise<RTCSessionDescriptionInit>;
    setRemoteAnswer: (ans:any) => Promise<void>;
    sendStream: (stream:MediaStream) => Promise<void>;
    remoteStream: MediaStream | null;
}

const PeerContext = React.createContext<PeerContextType | undefined>(undefined);
export const usePeer = () =>{
    return React.useContext(PeerContext);
}
export const PeerProvider = (props:any) => {

    const [remoteStream,setRemoteStream] = useState<MediaStream | null>(null);
    const peer = useMemo<RTCPeerConnection>(()=> new RTCPeerConnection({
        iceServers: [
            {
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:google.stun.twilio.com:3478"
                ]
            }
        ]
    }),[]);

    const createOffer = async () => {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        return offer;
    }
    const createAnswer = async (offer:any) =>{
        await peer.setRemoteDescription(offer);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        return answer;
    }
    const setRemoteAnswer = async (ans:any) =>{
        await peer.setRemoteDescription(ans);
    }
    const sendStream = useCallback(async (stream: MediaStream) => {
        const tracks = stream.getTracks();
        for (const track of tracks) {
            // Find if a sender already exists for this track's kind (audio or video)
            const sender = peer.getSenders().find(s => s.track?.kind === track.kind);
            
            if (sender) {
                // If a sender exists, replace its track. This is safe to call multiple times.
                console.log(`Replacing track for kind: ${track.kind}`);
                await sender.replaceTrack(track);
            } else {
                // If no sender exists for this kind, add the track.
                console.log(`Adding track for kind: ${track.kind}`);
                peer.addTrack(track, stream);
            }
        }
    }, [peer]);
    const handleTrackEvent = useCallback((ev:RTCTrackEvent)=>{
            const stream = ev.streams;
            setRemoteStream(stream[0])
        },[])
    
    useEffect(()=>{
        peer.addEventListener('track',handleTrackEvent)
        return () =>{
            peer.removeEventListener('track',handleTrackEvent)
        }
    },[peer,handleTrackEvent])
    return <PeerContext.Provider value={{peer,createOffer,createAnswer, setRemoteAnswer, sendStream, remoteStream}}> 
        {props.children}
    </PeerContext.Provider>
}