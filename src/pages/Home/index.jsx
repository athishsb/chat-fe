import { useSelector } from "react-redux";
import ChatArea from "./components/ChatArea";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import Dashboard from "../Dashboard";
// const socket = io("http://localhost:5000");
const socket = io("https://chat-be-wmal.onrender.com");
function Home() {
  const { selectedChat, user } = useSelector((state) => state.userReducer);
  const [onlineUser, setOnlineUser] = useState([]);

  useEffect(() => {
    if (user) {
      socket.emit("join-room", user._id);
      socket.emit("user-login", user._id);
      socket.on("online-users", (onlineUsers) => {
        setOnlineUser(onlineUsers);
      });
      socket.on("online-users-updated", (onlineUsers) => {
        setOnlineUser(onlineUsers);
      });
    }
  }, [user]);
  return (
    <div className="home-page">
      <Header socket={socket} />

      {location.pathname === "/" ? (
        <Dashboard />
      ) : location.pathname === "/chat" ? (
        <div className="main-content">
          <Sidebar socket={socket} onlineUser={onlineUser} />
          {selectedChat && <ChatArea socket={socket} />}
        </div>
      ) : null}
    </div>
  );
}

export default Home;
