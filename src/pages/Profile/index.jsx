import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadProfilePic } from "../../apiCalls/user";
import { hideLoader, showLoader } from "../../redux/loaderSlice";
import toast from "react-hot-toast";
import { setUser } from "../../redux/userSlice";

function Profile() {
  const { user } = useSelector((state) => state.userReducer);
  const [image, setImage] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?.profilePic) {
      setImage(user.profilePic);
    }
  }, [user]);

  function getInitials() {
    let fname = user?.firstname.toUpperCase()[0];
    let lname = user?.lastname.toUpperCase()[0];
    return fname + lname;
  }

  function getFullName() {
    let fname =
      user?.firstname.at(0).toUpperCase() +
      user?.firstname.slice(1).toLowerCase();
    let lname =
      user?.lastname.at(0).toUpperCase() +
      user?.lastname.slice(1).toLowerCase();
    return fname + " " + lname;
  }

  const onFileSelect = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader(file);

    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      setImage(reader.result);
    };
  };

  const updateProfilePic = async () => {
    let response = null;
    try {
      dispatch(showLoader());
      response = await uploadProfilePic(image);
      dispatch(hideLoader());

      if (response.success) {
        toast.success(response.message);
        dispatch(setUser(response.data));
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      dispatch(hideLoader());
      toast.error(error.message);
    }
  };

  return (
    <div className="profile-page-container">
      <div className="profile-pic-container">
        {image && (
          <img
            src={image}
            alt="Profile Pic"
            className="user-profile-pic-upload"
          />
        )}
        {!image && (
          <div className="user-default-profile-avatar">{getInitials()}</div>
        )}
      </div>

      <div className="profile-info-container">
        <div className="user-profile-name">
          <h1>{getFullName()}</h1>
        </div>
        <div>
          <b>Email: </b>
          {user?.email}
        </div>
        <div>
          <b>Account Created: </b>
          {moment(user?.createdAt).format("MMM DD, YYYY")}
        </div>
        <div className="select-profile-pic-container">
          <input type="file" onChange={onFileSelect} />
          <button className="upload-image-btn" onClick={updateProfilePic}>
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
