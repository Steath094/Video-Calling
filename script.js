const socket = new WebSocket(`ws://localhost:8080`);

let localStream;
let remoteStream;
let peerConnection;

const servers  = {
    iceServers: [
        {
            urls: ['stun1.l.google.com:19302','stun2.l.google.com:19302']
        }
    ]
}

let init = async () =>{
    localStream = await navigator.mediaDevices.getUserMedia({video:true,audio:false});
    document.getElementById('user-1').srcObject = localStream;
    
    socket.send(JSON.stringify({ type: 'Join', roomId: "1" }));
    socket.onmessage = async event =>{
        const parsedData = JSON.parse(event.data)
        if (parsedData.type=="Joined") {
            handleNewUserJoined();
        }
        if(parsedData.type=="MessageFromPeer"){
            console.log(parsedData);
            
            handleMessageFromPeer(parsedData);
        }
    }
}

let handleMessageFromPeer = async (parsedData) =>{
    if (parsedData.msgType=="offer") {
        createAnswer(parsedData.offer)
    }
    if (parsedData.msgType=="answer") {
        addAnswer(parsedData.answer)
    }
    if (parsedData.msgType=="candidate") {
        if (peerConnection) {
            peerConnection.addIceCandidate(parsedData.candidate)
        }
    }
}
let handleNewUserJoined = ()=>{
    createOffer();
}

let createPeerConnection = async () => {
    peerConnection = new RTCPeerConnection();

    remoteStream = new MediaStream();
    document.getElementById('user-2').srcObject = remoteStream;

    if (!localStream) {
        localStream = await navigator.mediaDevices.getUserMedia({video:true,audio:false});
        document.getElementById('user-1').srcObject = localStream;
    }
    localStream.getTracks().forEach((track)=>{
        peerConnection.addTrack(track,localStream)
    })

    peerConnection.ontrack = (event) =>{
        event.streams[0].getTracks().forEach((track)=>{
            remoteStream.addTrack(track)
        })
    }

    peerConnection.onicecandidate = async (event) =>{
        if (event.candidate) {
            socket.send(JSON.stringify({ type: 'Message', roomId: "1", msgType: "candidate",candidate: event.candidate }));
            
        }
    }
}

let createOffer = async () =>{
    await createPeerConnection();
    let offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.send(JSON.stringify({ type: 'Message', roomId: "1", msgType: "offer",offer }));
    
}

let createAnswer = async (offer) => {    
    await createPeerConnection();

    await peerConnection.setRemoteDescription(offer)

    let answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.send(JSON.stringify({ type: 'Message', roomId: "1", msgType: "answer",answer }));

}

let addAnswer = async (answer) => {
    if (!peerConnection.currentRemoteDescription) {
        peerConnection.setRemoteDescription(answer);
    }
} 
init();