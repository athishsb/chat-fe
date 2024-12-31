import { axiosInstance } from ".";


export const getLoggedUser = async () => {
    try {
        const response = await axiosInstance.get("https://chat-be-wmal.onrender.com/api/user/get-logged-user");
        return response.data;
    } catch (error) {
        return error;
    }
}


export const getAllUser = async () => {
    try {
        const response = await axiosInstance.get("https://chat-be-wmal.onrender.com/api/user/get-all-users");
        return response.data;
    } catch (error) {
        return error;
    }
}


export const uploadProfilePic = async (image) => {
    try {
        const response = await axiosInstance.post("https://chat-be-wmal.onrender.com/api/user/upload-profile-pic", { image });
        return response.data;
    } catch (error) {
        console.log(error);
        return error;
    }
}