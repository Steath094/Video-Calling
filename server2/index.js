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

io.on('connection', socket => {
    console.log("new connection", socket.id); // Good to log the ID

    socket.on("join-room", (data) => {
        const { roomId, emailId } = data;
        console.log(`User ${emailId} Joined ${roomId}`);
        mailToSocketMap.set(emailId, socket.id)
        socketTOMailMap.set(socket.id, emailId)
        socket.join(roomId);
        socket.emit('joined-room', { roomId })
        socket.broadcast.to(roomId).emit('user-joined', { emailId, id: socket.id }); // Also send the socket id
    });

    socket.on('call-user', (data) => {
        console.log('call coming in server');
        const { emailId, offer } = data
        const fromEmail = socketTOMailMap.get(socket.id);
        const socketId = mailToSocketMap.get(emailId);
        console.log(`Forwarding call from ${fromEmail} to socket ${socketId}`);

        // ✅ FIX: Use io.to() to send to a specific client
        io.to(socketId).emit('incoming-call', { from: fromEmail, offer });
    });

    socket.on('call-accepted', data => {
        const { emailId, ans } = data;
        const fromEmail = socketTOMailMap.get(socket.id);
        const socketId = mailToSocketMap.get(emailId);
        console.log(`Forwarding answer from ${fromEmail} to ${socketId}`);

        // ✅ FIX: Use io.to() here as well
        io.to(socketId).emit('call-accepted', { from: fromEmail, ans });
    });

    // You should also handle negotiation events
    socket.on('negotiation-needed', (data) => {
        const { offer, to } = data;
        const fromEmail = socketTOMailMap.get(socket.id);
        const socketId = mailToSocketMap.get(to);
        console.log(`Forwarding negotiation offer from ${fromEmail} to ${socketId}`);
        io.to(socketId).emit('negotiation-needed', { from: fromEmail, offer });
    });

    socket.on('negotiation-done', (data) => {
        const { to, ans } = data;
        const fromEmail = socketTOMailMap.get(socket.id);
        const socketId = mailToSocketMap.get(to);
        console.log(`Forwarding negotiation answer from ${fromEmail} to ${socketId}`);
        io.to(socketId).emit('negotiation-result', { from: fromEmail, ans });
    });
});

app.listen(3000,()=>{
    console.log(`App Listening on Port 3000`);
})
io.listen(8080);