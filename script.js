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
    
    socket.send(JSON.stringify({ type: 'JOIN', roomId: "1" }));
    socket.onmessage = async event =>{
        const parsedData = JSON.parse(event.data)
        if (parsedData.type=="JOINED") {
            console.log("New user Joined");
            
            // handleNewUserJoined(parsedData.socket);
        }
    }
    createOffer();
}


let handleNewUserJoined = ()=>{

}
let createOffer = async () =>{
    peerConnection = new RTCPeerConnection();

    remoteStream = new MediaStream();
    document.getElementById('user-2').srcObject = remoteStream;

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
            console.log('New Ice Candidate: ', event.candidate);
            
        }
    }

    let offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    console.log("offer ", offer);
    
}

init();