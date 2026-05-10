import { useEffect, useRef } from "react";
import "./App.css";

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        console.log(stream.getTracks());
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
