import { useRef, useState } from "react";
import { socket } from "../socket";

const useWebRTC = (localStream: React.RefObject<MediaStream | null>) => {
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  const [isUserConnected, setIsUserConnected] = useState<boolean>(false);

  const createPeerConnection = () => {
    // setup RTCPeerConnection
    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: ["stun:stun.l.google.com:19302"],
        },
      ],
    });

    // collect ICE candidates
    pc.onicecandidate = (event) => {
      console.log("Sending ICE candidates...");

      socket.emit("ice-candidate", event.candidate);
    };

    // start streaming video using the html video element
    pc.ontrack = (event) => {
      console.log("Remote track received");
      setIsUserConnected(true);

      setTimeout(() => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      }, 100);
    };

    // Hide remote video element as peer leaves room
    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;

      if (
        state === "disconnected" ||
        state === "failed" ||
        state === "closed"
      ) {
        setIsUserConnected(false);

        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
      }
    };

    // Add local tracks if they exist
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStream.current!);
      });
    }

    peerConnection.current = pc;
    return pc;
  };

  return {
    createPeerConnection,
    isUserConnected,
    setIsUserConnected,
    localStream,
    peerConnection,
    remoteVideoRef,
  };
};

export default useWebRTC;
