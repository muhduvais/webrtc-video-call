import { socket } from "../socket";

type useMediaControlProps = {
  peerConnection: React.RefObject<RTCPeerConnection | null>;
  localStream: React.RefObject<MediaStream | null>;
  setIsUserConnected: React.Dispatch<React.SetStateAction<boolean>>;
};

const useMediaControl = ({
  peerConnection,
  localStream,
  setIsUserConnected,
}: useMediaControlProps) => {
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
    socket.emit("leave-room", "room-1");

    // stops ICE, DTLS, SRTP and transport
    peerConnection.current?.close();

    // turns off camera and mic
    localStream.current?.getTracks().forEach((track) => track.stop());

    setIsUserConnected(false);

    // disconnets signaling channel
    socket.disconnect();
  };

  return { toggleMic, toggleCamera, leaveCall };
};

export default useMediaControl;
