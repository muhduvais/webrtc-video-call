import { useEffect, useRef } from "react";
import { socket } from "./socket";
import "./App.css";

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);

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
      console.log("Sending ICE candidates...");

      socket.emit("ice-candidate", event.candidate);
    };

    // start streaming video using the html video element
    peerConnection.current.ontrack = (event) => {
      console.log("Remote track received");

      const remoteVideo = document.getElementById(
        "remote-video",
      ) as HTMLVideoElement;

      if (remoteVideo) {
        remoteVideo.srcObject = event.streams[0];
      }
    };

    const startVideo = async () => {
      try {
        // grand permission for the mic and camera
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });

        localStream.current = stream;

        // adding the content that need to be sent to the other connections/peers
        stream.getTracks().forEach((track) => {
          peerConnection.current?.addTrack(track, stream);
        });

        socket.emit("join-room", "room-1");

        // listen for user-join
        socket.on("user-joined", async () => {
          console.log("Another user joined");

          // generates SDP and setup local description to send the data based on those specific configs
          const offer = await peerConnection.current?.createOffer();
          await peerConnection.current?.setLocalDescription(offer);

          // sends an offer
          socket.emit("offer", offer);
          console.log("Sent offer ");
        });

        // receive offer and create answer - set offer as remote description
        socket.on("offer", async (offer) => {
          console.log("Offer received");

          await peerConnection.current?.setRemoteDescription(offer);

          const answer = await peerConnection.current?.createAnswer();

          await peerConnection.current?.setLocalDescription(answer);

          socket.emit("answer", answer);
          console.log("Sent answer");
        });

        // receive answer and set it as remote description
        socket.on("answer", async (answer) => {
          console.log("Answer received");

          await peerConnection.current?.setRemoteDescription(answer);
        });

        socket.on("ice-candidate", async (candidate) => {
          console.log("ICE candidate received");

          try {
            await peerConnection.current?.addIceCandidate(candidate);
          } catch (error) {
            console.log(error);
          }
        });

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

  const toggleMic = () => {
    localStream.current
      ?.getAudioTracks()
      .forEach((track) => (track.enabled = !track.enabled));
  };

  const toggleCamera = () => {
    localStream.current
      ?.getVideoTracks()
      .forEach((track) => (track.enabled = !track.enabled));
  };

  const leaveCall = () => {
    // stops ICE, DTLS, SRTP and transport
    peerConnection.current?.close();

    // turns off camera and mic
    localStream.current?.getTracks().forEach((track) => track.stop());

    // disconnets signaling channel
    socket.disconnect();
  };

  return (
    <>
      <div className="main-container">
        <h2>WebRTC App</h2>

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
          id="remote-video"
          autoPlay
          playsInline
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
