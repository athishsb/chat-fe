import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { createChat } from "../../../apiCalls/chat";
import { hideLoader, showLoader } from "../../../redux/loaderSlice";
import { setAllChat, setSelectedChat } from "../../../redux/userSlice";
import moment from "moment";
import { useEffect } from "react";
import store from "../../../redux/store";

function UsersList({ searchKey, socket, onlineUser }) {
  const {
    allUsers,
    allChats,
    user: currentUser,
    selectedChat,
  } = useSelector((state) => state.userReducer);
  const dispatch = useDispatch();

  const startNewChat = async (searchedUserId) => {
    let response = null;
    try {
      dispatch(showLoader());
      response = await createChat([currentUser._id, searchedUserId]);
      dispatch(hideLoader());

      if (response.success) {
        toast.success(response.message);
        const newChat = response.data;
        const updatedChat = [...allChats, newChat];
        dispatch(setAllChat(updatedChat));
        dispatch(setSelectedChat(newChat));
        socket.emit("new-chat-created", {
          newChat,
          member: searchedUserId,
        });
      }
    } catch (error) {
      dispatch(hideLoader());
      toast.error(error.message);
    }
  };

  const openChat = (selectedUserId) => {
    const chat = allChats.find(
      (chat) =>
        chat.members.map((m) => m._id).includes(currentUser._id) &&
        chat.members.map((m) => m._id).includes(selectedUserId)
    );

    if (chat) {
      dispatch(setSelectedChat(chat));
    }
  };

  const isSelectedChat = (user) => {
    if (selectedChat) {
      return selectedChat.members.map((m) => m._id).includes(user._id);
    }
    return false;
  };

  const getLatestMessage = (userId) => {
    const chat = allChats.find((chat) =>
      chat.members.map((m) => m._id).includes(userId)
    );

    if (!chat || !chat.latestMessage) {
      return "";
    } else {
      const msgPrefix =
        chat?.latestMessage?.sender === currentUser._id ? "You: " : "";
      return (
        msgPrefix +
        (chat?.latestMessage?.image
          ? "Image"
          : chat?.latestMessage?.text.substring(0, 25))
      );
    }
  };

  const getLatestMessageTimeStamp = (userId) => {
    const chat = allChats.find((chat) =>
      chat.members.map((m) => m._id).includes(userId)
    );

    if (!chat || !chat?.latestMessage) {
      return "";
    } else {
      return moment(chat?.latestMessage?.createdAt).format("hh:mm A");
    }
  };

  function formatName(user) {
    let fname =
      user.firstname.at(0).toUpperCase() +
      user.firstname.slice(1).toLowerCase();
    let lname =
      user.lastname.at(0).toUpperCase() + user.lastname.slice(1).toLowerCase();
    return fname + " " + lname;
  }

  const getUnreadMessageCount = (userId) => {
    const chat = allChats.find((chat) =>
      chat.members.map((m) => m._id).includes(userId)
    );

    if (
      chat &&
      chat.unreadMessageCount &&
      chat.latestMessage.sender !== currentUser._id
    ) {
      return (
        <div className="unread-message-counter">{chat.unreadMessageCount}</div>
      );
    } else {
      return "";
    }
  };

  function getData() {
    if (searchKey === "") {
      return allChats;
    } else {
      return allUsers.filter((user) => {
        return (
          user.firstname.toLowerCase().includes(searchKey.toLowerCase()) ||
          user.lastname.toLowerCase().includes(searchKey.toLowerCase())
        );
      });
    }
  }

  useEffect(() => {
    socket.off("set-message-count").on("set-message-count", (message) => {
      const selectedChat = store.getState().userReducer.selectedChat;
      let allChats = store.getState().userReducer.allChats;

      if (selectedChat?._id !== message.chatId) {
        const updatedChats = allChats.map((chat) => {
          if (chat._id === message.chatId) {
            return {
              ...chat,
              unreadMessageCount: (chat?.unreadMessageCount || 0) + 1,
              latestMessage: message,
            };
          } else {
            return chat;
          }
        });
        allChats = updatedChats;
      }
      // 1.find the latest chat
      const latestChat = allChats.find((chat) => chat._id === message.chatId);

      // 2.get all other chats
      const otherChats = allChats.filter((chat) => chat._id !== message.chatId);

      // 3. create a new array with latest chat on top & then other chats
      allChats = [latestChat, ...otherChats];

      dispatch(setAllChat(allChats));
    });
  }, [socket]);

  useEffect(() => {
    const selectedChat = store.getState().userReducer.selectedChat;
    console.log(selectedChat);

    socket.emit("selectedChat", selectedChat);
  }, [selectedChat, socket]);

  useEffect(() => {
    socket.on("new-chat-created-received", (newChat) => {
      const allChats = store.getState().userReducer.allChats;

      // Avoid duplicates if the chat already exists
      if (!allChats.some((chat) => chat._id === newChat._id)) {
        const updatedChats = [newChat, ...allChats];
        dispatch(setAllChat(updatedChats));
        toast.success("New chat created!");
      }
    });

    return () => {
      socket.off("new-chat-created-received");
    };
  }, []);

  return getData().map((obj) => {
    let user = obj;
    if (obj.members) {
      user = obj.members.find((m) => m._id !== currentUser._id);
    }

    return (
      <div
        key={user._id}
        className="user-search-filter"
        onClick={() => openChat(user._id)}
      >
        <div
          className={isSelectedChat(user) ? "selected-user" : "filtered-user"}
        >
          <div className="filter-user-display">
            {user.profilePic && (
              <img
                src={user.profilePic}
                alt="Profile Pic"
                className="user-profile-image"
                style={
                  onlineUser.includes(user._id)
                    ? { border: "#82e0aa 3px solid" }
                    : []
                }
              />
            )}
            {!user.profilePic && (
              <div
                className={
                  isSelectedChat(user)
                    ? "user-selected-avatar"
                    : "user-default-avatar"
                }
                style={
                  onlineUser.includes(user._id)
                    ? { border: "#82e0aa 3px solid" }
                    : []
                }
              >
                {user.firstname.charAt(0).toUpperCase() +
                  user.lastname.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="filter-user-details">
              <div className="user-display-name">{formatName(user)}</div>
              <div className="user-display-email">
                {getLatestMessage(user._id) || user.email}
              </div>
            </div>
            <div>
              {getUnreadMessageCount(user._id)}

              <div className="latest-message-timestamp">
                {getLatestMessageTimeStamp(user._id)}
              </div>
            </div>
            {!allChats.find((chat) =>
              chat.members.map((m) => m._id).includes(user._id)
            ) && (
              <div className="user-start-chat">
                <button
                  className="user-start-chat-btn"
                  onClick={() => startNewChat(user._id)}
                >
                  Start Chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  });
}

export default UsersList;
