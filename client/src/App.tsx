import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import {SocketProvider} from './providers/Socket'
import {PeerProvider } from './providers/Peer'
import Room from "./pages/Room"
import { useState } from "react"
function App() {
const [myStream, setMyStream] = useState<MediaStream | null>(null);
  return (
    <div>
      <SocketProvider>
        <PeerProvider>
          <Routes>
            <Route path="/" element={<Home setMyStream={setMyStream}/>} />
            <Route path="/room/:roomId" element={<Room myStream={myStream}/>} />
          </Routes>
        </PeerProvider>
      </SocketProvider>
    </div>
  )
}

export default App
