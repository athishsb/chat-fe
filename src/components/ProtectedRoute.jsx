import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUser, getLoggedUser } from "../apiCalls/user";
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import toast from "react-hot-toast";
import {
  setAllChat,
  setAllUser,
  setUser,
  setNotifications,
} from "../redux/userSlice";
import { getAllChats } from "../apiCalls/chat";
import { getNotifications } from "../apiCalls/message";

function ProtectedRoute({ children }) {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const getLoggedInUser = async () => {
    let response = null;
    try {
      dispatch(showLoader());
      response = await getLoggedUser();
      dispatch(hideLoader());
      if (response.success) {
        dispatch(setUser(response.data));
      } else {
        toast.error(response.message);
        window.location.href = "/login";
      }
    } catch (error) {
      dispatch(hideLoader());
      toast.error(error.message);
      navigate("/login");
    }
  };

  const getAllUsers = async () => {
    let response = null;
    try {
      dispatch(showLoader());
      response = await getAllUser();
      dispatch(hideLoader());
      if (response.success) {
        dispatch(setAllUser(response.data));
      } else {
        toast.error(response.message);
        window.location.href = "/login";
      }
    } catch (error) {
      dispatch(hideLoader());
      toast.error(error.message);
      navigate("/login");
    }
  };

  const getCurrentUserChats = async () => {
    try {
      const response = await getAllChats();
      if (response.success) {
        dispatch(setAllChat(response.data));
      }
    } catch (error) {
      toast.error(error.message);
      navigate("/login");
    }
  };

  const getCurrentUserNotifications = async () => {
    try {
      const response = await getNotifications();
      if (response.success) {
        dispatch(setNotifications(response.data));
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      // write logic to get the details of current user
      getLoggedInUser();
      getAllUsers();
      getCurrentUserChats();
      getCurrentUserNotifications();
    } else {
      navigate("/login");
    }
  }, []);

  return <div>{children}</div>;
}

export default ProtectedRoute;
