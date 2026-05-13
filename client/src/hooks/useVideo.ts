import { useRef } from "react";

const useVideo = (
  peerConnection: React.RefObject<RTCPeerConnection | null>,
  localStream: React.RefObject<MediaStream | null>,
) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

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

      // stream the video on screen
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

    } catch (error) {
      console.log(error);
    }
  };

  return { startVideo, videoRef };
};

export default useVideo;
