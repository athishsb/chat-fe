import { axiosInstance } from ".";

export const getAllChats = async () => {
    try {
        const response = await axiosInstance.get('https://chat-be-wmal.onrender.com/api/chat/get-all-chats');
        return response.data;
    } catch (error) {
        return error;
    }
}


export const createChat = async (members) => {
    try {
        const response = await axiosInstance.post('https://chat-be-wmal.onrender.com/api/chat/create-new-chat', { members });
        return response.data;
    } catch (error) {
        return error;
    }
}


export const clearUnreadMessageCount = async (chatId) => {
    try {
        const response = await axiosInstance.post('https://chat-be-wmal.onrender.com/api/chat/clear-unread-message', { chatId: chatId });
        return response.data;
    } catch (error) {
        return error;
    }
}
