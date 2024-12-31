import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import store from "../../../redux/store";
// import { setSelectedChat } from "../../../redux/userSlice";

function Header({ socket }) {
  const { user, notifications } = useSelector((state) => state.userReducer);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  // const dispatch = useDispatch();

  function getFullName() {
    let fname =
      user?.firstname.at(0).toUpperCase() +
      user?.firstname.slice(1).toLowerCase();
    let lname =
      user?.lastname.at(0).toUpperCase() +
      user?.lastname.slice(1).toLowerCase();
    return fname + " " + lname;
  }

  function getInitials() {
    let fname = user?.firstname.toUpperCase()[0];
    let lname = user?.lastname.toUpperCase()[0];
    return fname + lname;
  }

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
    socket.emit("user-offline", user._id);
  }

  // Calculate unread messages count
  useEffect(() => {
    const currentPath = window.location.pathname;

    if (currentPath !== "/chat") {
      // Sum up all unread message counts from global state
      const totalUnreadCount = notifications;
      console.log("totalUnreadCount: ", totalUnreadCount);

      setUnreadCount(totalUnreadCount);
    }
  }, [notifications]);

  // Update unread count in real-time using socket
  useEffect(() => {
    socket.on("set-notification-count", (message) => {
      const user = store.getState().userReducer.user;

      const currentPath = window.location.pathname;

      // Increment only if the user is not in the chat
      if (currentPath !== "/chat" && message.sender !== user?._id) {
        setUnreadCount((prevCount) => prevCount + 1);
      }
    });
  }, []);

  // Handle notification click
  const handleNotificationClick = () => {
    setUnreadCount(0); // Reset the local notification count
  };

  return (
    <div className="app-header">
      <div className="app-logo">
        <i className="fa fa-comments" aria-hidden="true"></i>
        <a href="/">Quick Chat</a>
      </div>
      {/* bell notification */}
      <div className="app-notifications">
        <a href="/chat" onClick={handleNotificationClick}>
          <i className="fa fa-bell" aria-hidden="true"></i>
        </a>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>
      <div className="app-user-profile">
        {user?.profilePic && (
          <img
            src={user?.profilePic}
            alt="profile-pic"
            className="logged-user-profile-pic"
            onClick={() => navigate("/profile")}
          />
        )}
        {!user?.profilePic && (
          <div
            className="logged-user-profile-pic"
            onClick={() => navigate("/profile")}
          >
            {getInitials()}
          </div>
        )}
        <div className="logged-user-name">{getFullName()}</div>
        <button className="logout-button" onClick={logout}>
          <i className="fa fa-power-off"></i>
        </button>
      </div>
    </div>
  );
}

export default Header;
