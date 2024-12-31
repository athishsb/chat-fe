import { axiosInstance } from ".";

export const signupUser = async (user) => {
    try {
        const response = await axiosInstance.post('https://chat-be-wmal.onrender.com/api/auth/signup', user);
        return response.data;
    } catch (error) {
        return error;
    }
}


export const loginUser = async (user) => {
    try {
        const response = await axiosInstance.post('https://chat-be-wmal.onrender.com/api/auth/login', user);
        return response.data;
    } catch (error) {
        return error;
    }
}

