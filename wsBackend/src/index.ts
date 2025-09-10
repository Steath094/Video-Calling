import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({port: 8080})
const rooms: Map<string,Set<WebSocket>> = new Map();
wss.on("connection",(socket)=>{
    console.log("Joined");
    socket.on("message",(data:string)=>{
        const parsedData = JSON.parse(data)
        const { roomId } = parsedData;
        if (parsedData.type=="Join") {
            console.log("working");
            
            if (!rooms.has(roomId)) {
                rooms.set(roomId,new Set())
            }
            if (rooms.get(roomId)?.size==2) {
                socket.send(JSON.stringify({
                    type: "Error",
                    message : "Room Full"
                }))
                return
            }
            rooms.get(roomId)?.add(socket)
            rooms.get(roomId)?.forEach(s=>{
                if(s!=socket){
                    s.send(JSON.stringify({
                        type: "Joined",
                    }))
                }
            })
        }
        if (parsedData.type=="Message") {
            rooms.get(roomId)?.forEach(s=>{
                if(s!=socket){
                    parsedData.type= "MessageFromPeer"
                    s.send(JSON.stringify(parsedData))
                }
            })
        }
        console.log("Rooms: ",rooms);

    })
    
})


console.log("Running on PORT 8080");
