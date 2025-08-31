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
            console.log('Fetching user data from:', `${backendUrl}/api/user/profile`);
            const { data } = await axios.get(`${backendUrl}/api/user/profile`, { 
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('User data response:', data);
            
            if (data.success && data.userdata) {
                setUserdata(data.userdata);
                setIsLoggedin(true);
                return data.userdata;
            } else {
                // clear any stale userdata
                setUserdata(null);
                setIsLoggedin(false);
                console.log('Failed to get user data:', data.message);
                return null;
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            // treat as not logged in when profile fetch fails
            setUserdata(null);
            setIsLoggedin(false);
            
            // Only show error toast if it's not a 401 (unauthorized) error on initial load
            if (error.response?.status !== 401) {
                if (error.response?.data?.message) {
                    toast.error(error.response.data.message);
                }
            }
            return null;
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
