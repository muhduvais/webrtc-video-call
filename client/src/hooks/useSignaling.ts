import { useEffect } from "react";
import { socket } from "../socket";

type UseSignalingProps = {
  peerConnection: React.RefObject<RTCPeerConnection | null>;
  createPeerConnection: () => RTCPeerConnection;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  setIsUserConnected: React.Dispatch<React.SetStateAction<boolean>>;
};

const useSignaling = ({
  peerConnection,
  createPeerConnection,
  remoteVideoRef,
  setIsUserConnected,
}: UseSignalingProps) => {
  useEffect(() => {
    
    // listen for user-join
    socket.on("user-joined", async () => {
      console.log("Another user joined");

      // generates SDP and setup local description to send the data based on those specific configs
      const offer = await peerConnection.current?.createOffer();
      await peerConnection.current?.setLocalDescription(offer);

      // sends an offer
      socket.emit("offer", offer);
      console.log("Sent offer");
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

    socket.on("user-left", () => {
      console.log("Peer left, resetting...");
      setIsUserConnected(false);

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }

      peerConnection.current?.close();

      createPeerConnection();
    });

    return () => {
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, []);
};

export default useSignaling;
