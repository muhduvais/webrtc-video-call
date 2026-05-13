import { useEffect, useRef } from "react";
import "./App.css";
import useWebRTC from "./hooks/useWebRTC";
import useVideo from "./hooks/useVideo";
import useSignaling from "./hooks/useSignaling";
import useMediaControl from "./hooks/useMediaControl";
import { socket } from "./socket";

function App() {
  const localStream = useRef<MediaStream | null>(null);
  const {
    createPeerConnection,
    peerConnection,
    remoteVideoRef,
    isUserConnected,
    setIsUserConnected,
  } = useWebRTC(localStream);

  const { startVideo, videoRef } = useVideo(peerConnection, localStream);
  
  useSignaling({
    peerConnection,
    createPeerConnection,
    remoteVideoRef,
    setIsUserConnected,
  });

  const { toggleCamera, toggleMic, leaveCall } = useMediaControl({
    peerConnection,
    localStream,
    setIsUserConnected,
  });

  useEffect(() => {
    const init = async () => {
      createPeerConnection();
      await startVideo();
      // Let others know current user joined the room
      socket.emit("join-room", "room-1");
    };

    init();
  }, []);

  return (
    <>
      <div className="main-container">
        <h2>WebRTC App</h2>
        <div className="video-container">
          <div className="localVideo">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                width: "600px",
                border: "1px solid black",
              }}
            />

            <div className="buttons">
              <button onClick={toggleMic}>Toggle Mic</button>
              <button onClick={toggleCamera}>Toggle Camera</button>
              <button onClick={leaveCall}>Leave call</button>
            </div>
          </div>

          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{
              width: "600px",
              border: "1px solid black",
              display: isUserConnected ? "block" : "none",
            }}
          />
        </div>
      </div>
    </>
  );
}

export default App;
