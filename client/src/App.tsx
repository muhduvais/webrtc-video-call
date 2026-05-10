import { useEffect } from "react";
import { socket } from "./socket";
import "./App.css";

function App() {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected: ", socket.id);

      socket.emit("message", "Hello from client");

      socket.on("message", (data) => {
        console.log("Message: ", data);
      });
    });

    return () => {
      socket.off("connect");
    };
  }, []);

  return (
    <>
      <div className="main-container">
        <h2>WebRTC App</h2>
      </div>
    </>
  );
}

export default App;
