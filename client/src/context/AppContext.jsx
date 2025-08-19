import { createContext, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const AppContext = createContext();


export const AppContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [isLoggedin, setIsLoggedin] = useState(false);
    const [userdata, setUserdata] = useState(() => {
        const stored = localStorage.getItem('userdata');
        return stored ? JSON.parse(stored) : null;
    });

    const getUserData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/profile`, { withCredentials: true });
            if (data.success) {
                setUserdata(data.userdata);
            } else {
                toast.error(data.message || 'Failed to load user data');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "An error occurred");
        }
    };

    // Logout: call server to clear cookie and clear client state
    const logout = async () => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/auth/logout`, {}, { withCredentials: true });
            if (data.success) {
                setUserdata(null);
                setIsLoggedin(false);
                toast.success(data.message || 'Logged out');
            } else {
                toast.error(data.message || 'Logout failed');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Logout error');
        }
    };

    const value = {
        backendUrl,
        isLoggedin,
        setIsLoggedin,
        userdata,
        setUserdata,
        getUserData,
        logout,
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};