import React from "react"
import { useMemo } from "react";
import { io, Socket } from 'socket.io-client'
const SocketContext = React.createContext<Socket | null>(null);

export const useSocket = () =>{
    return React.useContext(SocketContext);
}
export const SocketProvider = (props:any) =>{
    const socket = useMemo(()=> io('http://localhost:8080'),[])
    
    return (
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>
    )
}