const socket = new WebSocket(`ws://ec2-15-206-167-199.ap-south-1.compute.amazonaws.com:8080`);

let localStream;
let remoteStream;
let peerConnection;

let queryString = window.location.search
let urlParams = new URLSearchParams(queryString)
let roomId = urlParams.get('room')


if(!roomId){
    window.location = `lobby.html`
}
const servers  = {
    iceServers: [
        {
            urls: ['stun1.l.google.com:19302','stun2.l.google.com:19302']
        }
    ]
}



let contraints = {
    video: {
        width: {mid:640, ideal: 1280, max: 1280},
        hieght: {min:480,ideal: 720, max: 720}
    },
    audio: true
}

let init = async () =>{
    localStream = await navigator.mediaDevices.getUserMedia(contraints);
    document.getElementById('user-1').srcObject = localStream;
    
    socket.send(JSON.stringify({ type: 'Join', roomId }));
    socket.onmessage = async event =>{
        const parsedData = JSON.parse(event.data)
        if (parsedData.type=="Joined") {
            handleNewUserJoined();
        }
        if(parsedData.type=="MessageFromPeer"){
            console.log(parsedData);
            
            handleMessageFromPeer(parsedData);
        }
        if(parsedData.type=="leave"){
            handleUserLeft();
        }
    }
}
let handleUserLeft = () =>{
    document.getElementById("user-2").style.display="none"
    document.getElementById('user-1').classList.remove("smallFrame")

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
    document.getElementById('user-2').style.display ='block'
    document.getElementById('user-1').classList.add("smallFrame")
    if (!localStream) {
        localStream = await navigator.mediaDevices.getUserMedia(contraints);
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
            socket.send(JSON.stringify({ type: 'Message', roomId, msgType: "candidate",candidate: event.candidate }));
            
        }
    }
}

let createOffer = async () =>{
    await createPeerConnection();
    let offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.send(JSON.stringify({ type: 'Message', roomId, msgType: "offer",offer }));
    
}

let createAnswer = async (offer) => {    
    await createPeerConnection();

    await peerConnection.setRemoteDescription(offer)

    let answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.send(JSON.stringify({ type: 'Message', roomId, msgType: "answer",answer }));

}

let addAnswer = async (answer) => {
    if (!peerConnection.currentRemoteDescription) {
        peerConnection.setRemoteDescription(answer);
    }
} 


let toggleCamera = () =>{
    let vidoeTrack = localStream.getTracks().find(track=> track.kind === "video")

    if (vidoeTrack.enabled) {
        vidoeTrack.enabled =false;
        document.getElementById('camera-btn').style.backgroundColor = 'rgb(255,80,80)'
    }else{
         vidoeTrack.enabled =true;
        document.getElementById('camera-btn').style.backgroundColor = 'rgb(179,102,249,.9)'
    }
}

let toggleMic = () =>{
    let audioTrack = localStream.getTracks().find(track=> track.kind === "audio")

    if (audioTrack.enabled) {
        audioTrack.enabled =false;
        document.getElementById('mic-btn').style.backgroundColor = 'rgb(255,80,80)'
    }else{
         audioTrack.enabled =true;
        document.getElementById('mic-btn').style.backgroundColor = 'rgb(179,102,249,.9)'
    }
}
document.getElementById('camera-btn').addEventListener("click",toggleCamera);
document.getElementById('mic-btn').addEventListener("click",toggleMic);
init();