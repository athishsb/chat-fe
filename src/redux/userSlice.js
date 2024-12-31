import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
    name: 'user',
    initialState: {
        user: null,
        allUsers: [],
        allChats: [],
        selectedChat: null,
        notifications: 0,
    },
    reducers: {
        setUser: (state, action) => { state.user = action.payload },
        setAllUser: (state, action) => { state.allUsers = action.payload },
        setAllChat: (state, action) => { state.allChats = action.payload },
        setSelectedChat: (state, action) => { state.selectedChat = action.payload },
        setNotifications: (state, action) => { state.notifications = action.payload },
    },
});

export const { setUser, setAllUser, setAllChat, setSelectedChat, setNotifications } = userSlice.actions;
export default userSlice.reducer;