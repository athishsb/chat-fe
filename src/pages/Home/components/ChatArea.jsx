import { useDispatch, useSelector } from "react-redux";
import { createMessage, getAllMessages } from "../../../apiCalls/message";
import { hideLoader, showLoader } from "../../../redux/loaderSlice";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import moment from "moment";
import { clearUnreadMessageCount } from "../../../apiCalls/chat";
import store from "../../../redux/store";
import { setAllChat } from "../../../redux/userSlice";
import EmojiPicker from "emoji-picker-react";

function ChatArea({ socket }) {
  const dispatch = useDispatch();
  const { selectedChat, user, allChats } = useSelector(
    (state) => state.userReducer
  );
  const selectedUser = selectedChat.members.find((u) => u._id !== user._id);
  const [message, setMessage] = useState("");
  const [image, setImage] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [data, setData] = useState(null);

  const sendImage = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader(file);
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      setImage(reader.result);
      toast.success("Image added successfully");
    };
  };

  const formatTime = (timestamp) => {
    const now = moment();
    const diff = now.diff(moment(timestamp), "days");

    if (diff < 1) {
      return `Today ${moment(timestamp).format("hh:mm A")}`;
    } else if (diff == 1) {
      return `Yesterday ${moment(timestamp).format("hh:mm A")}`;
    } else {
      return moment(timestamp).format("MMM D, hh:mm A");
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

  const sendMessage = async () => {
    let response = null;
    // If both message and image are empty, return
    if (message === "" && image === "") return;
    try {
      const messageObj = {
        chatId: selectedChat._id,
        sender: user._id,
        text: message,
        image: image,
      };

      socket.emit("send-message", {
        ...messageObj,
        members: selectedChat.members.map((m) => m._id),
        read: false,
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      });

      response = await createMessage(messageObj);

      if (response.success) {
        setMessage("");
        setImage("");
        setShowEmojiPicker(false);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getMessage = async () => {
    let response = null;
    try {
      dispatch(showLoader());
      response = await getAllMessages(selectedChat._id);
      dispatch(hideLoader());

      if (response.success) {
        setAllMessages(response.data);
      }
    } catch (error) {
      dispatch(hideLoader());
      toast.error(error.message);
    }
  };

  const clearUnreadMessages = async () => {
    let response = null;
    try {
      socket.emit("clear-unread-messages", {
        chatId: selectedChat._id,
        members: selectedChat.members.map((m) => m._id),
      });
      response = await clearUnreadMessageCount(selectedChat._id);

      if (response.success) {
        allChats.map((chat) => {
          if (chat._id === selectedChat._id) {
            return response.data;
          } else {
            return chat;
          }
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    let stopRead;
    getMessage();
    if (selectedChat?.latestMessage?.sender !== user._id && !stopRead) {
      clearUnreadMessages();
    }

    socket.on("block-read-message", (data) => {
      const { onlineUsers, members, bothMembersOnline } = data;

      console.log("Online users:", onlineUsers);
      console.log("Members:", members);
      console.log("Are both members online?:", bothMembersOnline);

      if (bothMembersOnline) {
        stopRead = false; // == 1
        console.log("Both members are online. Allowing read.");
      } else {
        stopRead = true; // == 2
        console.log("Not all members are online. Preventing read.");
      }
    });

    socket.off("receive-message").on("receive-message", (message) => {
      const selectedChat = store.getState().userReducer.selectedChat;
      if (selectedChat._id === message.chatId) {
        setAllMessages((prevMessage) => [...prevMessage, message]);
      }
      if (
        selectedChat._id === message.chatId &&
        message.sender !== user._id &&
        !stopRead
      ) {
        clearUnreadMessages();
      }
    });

    socket.off("message-count-cleared").on("message-count-cleared", (data) => {
      const selectedChat = store.getState().userReducer.selectedChat;
      const allChats = store.getState().userReducer.allChats;

      if (selectedChat?._id === data?.chatId && !stopRead) {
        // Updating unread message count in chat object
        const updatedChats = allChats?.map((chat) => {
          if (chat?._id === data?.chatId) {
            return {
              ...chat,
              unreadMessageCount: 0,
            };
          } else {
            return chat;
          }
        });
        dispatch(setAllChat(updatedChats));

        // Updating read property in message object
        setAllMessages((prevMessages) => {
          return prevMessages?.map((message) => {
            return {
              ...message,
              read: true,
            };
          });
        });
      }
    });

    socket.on("started-typing", (data) => {
      setData(data);
      if (selectedChat._id === data.chatId && data.sender !== user._id) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    });
  }, [selectedChat]);

  useEffect(() => {
    const msgContainer = document.getElementById("main-chat-area");
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }, [allMessages, isTyping]);

  return (
    <>
      {selectedChat && (
        <div className="app-chat-area">
          <div className="app-chat-area-header">{formatName(selectedUser)}</div>
          <div className="main-chat-area" id="main-chat-area">
            {allMessages.map((msg) => {
              const isCurrentUserSender = msg.sender === user._id;

              return (
                <div
                  key={msg._id}
                  className="message-container"
                  style={
                    isCurrentUserSender
                      ? { justifyContent: "end" }
                      : { justifyContent: "start" }
                  }
                >
                  <div>
                    <div
                      className={
                        isCurrentUserSender
                          ? "send-message"
                          : "received-message"
                      }
                    >
                      <div>
                        {msg.image && (
                          <img
                            src={msg.image}
                            alt="image"
                            height="120"
                            width="120"
                          />
                        )}
                      </div>
                      <div>{msg.text}</div>
                    </div>
                    <div
                      className="message-timestamp"
                      style={
                        isCurrentUserSender
                          ? { float: "right" }
                          : { float: "left" }
                      }
                    >
                      {formatTime(msg.createdAt)}
                      {isCurrentUserSender && msg.read && (
                        <i
                          className="fa fa-check-circle"
                          aria-hidden="true"
                          style={{ color: "#e74c3c" }}
                        ></i>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="typing-indicator">
              {isTyping &&
                selectedChat?.members
                  .map((m) => m._id)
                  .includes(data?.sender) && <i>typing...</i>}
            </div>
          </div>

          {showEmojiPicker && (
            <div
              style={{
                width: "100%",
                display: "flex",
                padding: "0px 20px",
                justifyContent: "right",
              }}
            >
              <EmojiPicker
                style={{ width: "300px", height: "400px" }}
                onEmojiClick={(e) => setMessage(message + e.emoji)}
              />
            </div>
          )}
          <div className="send-message-div">
            <input
              type="text"
              className="send-message-input"
              placeholder="Type a message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                socket.emit("user-typing", {
                  chatId: selectedChat._id,
                  members: selectedChat.members.map((m) => m._id),
                  sender: user._id,
                });
              }}
            />
            <label htmlFor="file">
              <i
                className={`fa fa-picture-o ${
                  image ? "image-ready" : "send-image-btn"
                }`}
              ></i>
              <input
                type="file"
                id="file"
                style={{ display: "none" }}
                accept="image/jpg, image/png, image/jpeg, image/gif"
                onChange={sendImage}
              />
            </label>
            <button
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
              }}
              className="fa fa-smile-o send-emoji-btn"
              aria-hidden="true"
            ></button>
            <button
              onClick={() => sendMessage()}
              className="fa fa-paper-plane send-message-btn"
              aria-hidden="true"
            ></button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatArea;
