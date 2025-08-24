import { createContext, useState, useEffect } from 'react';
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
                // clear any stale userdata
                setUserdata(null);
                toast.error(data.message || 'Failed to load user data');
            }
        } catch (error) {
            // treat as not logged in when profile fetch fails
            setUserdata(null);
            // don't spam the user on mount; only show if there's a response message
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            }
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

    // On mount: attempt to fetch user profile (if token cookie exists)
    useEffect(() => {
        getUserData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Persist userdata to localStorage and update isLoggedin flag
    useEffect(() => {
        if (userdata) {
            localStorage.setItem('userdata', JSON.stringify(userdata));
            setIsLoggedin(true);
        } else {
            localStorage.removeItem('userdata');
            setIsLoggedin(false);
        }
    }, [userdata]);

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
