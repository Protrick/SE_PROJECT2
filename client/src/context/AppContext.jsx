import createContext from 'react';

export const AppContext = createContext();

export const AppContextProvider = (props)=>{

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [isLoggedin, setIsLoggedin] = useState(false);
    const [userdata, setUserdata] = useState(null);

    const value = {
        backendUrl,
        isLoggedin,
        setIsLoggedin,
        userdata,
        setUserdata
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}