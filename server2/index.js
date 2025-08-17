import express from 'express'
import {Server} from 'socket.io'
import cors from 'cors'
const app = express();
const io = new Server({
    cors: true
});

app.use(express.json());
app.use(cors({origin:'*'}));
const mailToSocketMap = new Map();
const socketTOMailMap = new Map();
io.on('connection',socket =>{
    console.log("new connection");
    
    socket.on("join-room",(data)=>{
        const {roomId, emailId } = data;
        console.log(`User ${emailId} Joined ${roomId}`);
        mailToSocketMap.set(emailId,socket.id)
        socketTOMailMap.set(socket.id,emailId)
        socket.join(roomId);
        socket.emit('joined-room',{roomId})
        socket.broadcast.to(roomId).emit('user-joined',{emailId})
    })
    socket.on('call-user',(data)=>{
        console.log('call coming in server');
        
        const { emailId, offer } = data
        const fromEmail = socketTOMailMap.get(socket.id);
        const socketId = mailToSocketMap.get(emailId);
        console.log(mailToSocketMap);
        console.log(socketId);
        
        socket.to(socketId).emit('incoming-call', { from: fromEmail, offer})
    })
    socket.on('call-accepted', data=>{
        const { emailId, ans } = data;
        const socketId = mailToSocketMap.get(emailId);
        socket.to(socketId).emit('call-accepted', {ans})

    })
})

app.listen(3000,()=>{
    console.log(`App Listening on Port 3000`);
})
io.listen(8080);