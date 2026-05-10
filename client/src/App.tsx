import { useEffect, useRef } from "react";
import "./App.css";

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    // setup RTCPeerConnection
    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        {
          urls: ["stun:stun.l.google.com:19302"],
        },
      ],
    });

    // collect ICE candidates
    peerConnection.current.onicecandidate = (event) => {
      console.log("ICE Candidate: ", event.candidate);
    };

    const startVideo = async () => {
      try {
        // grand permission for the mic and camera
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });

        // adding the content that need to be sent to the other connections/peers
        stream.getTracks().forEach((track) => {
          peerConnection.current?.addTrack(track, stream);
        });

        // generates SDP and setup local description to send the data based on those specific configs
        const offer = await peerConnection.current?.createOffer();
        await peerConnection.current?.setLocalDescription(offer);

        // stream the video on screen
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
      } catch (error) {
        console.log(error);
      }
    };

    startVideo();
  }, []);

  return (
    <>
      <div className="main-container">
        <h2>WebRTC App</h2>

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: "600px",
            border: "1px solid black",
          }}
        />
      </div>
    </>
  );
}

export default App;
