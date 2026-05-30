import React, { createContext, useState, useContext } from 'react';

// Create the context
const AuthContext = createContext();

// Create a provider component
export function AuthProvider({ children }) {
    // Initialize state from local storage so it persists on refresh
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('avira_user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const saveUser = (userData) => {
        localStorage.setItem('avira_user', JSON.stringify(userData));
        setUser(userData.user);
    };

    const forgetUser = () => {
        localStorage.removeItem('avira_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            saveUser,
            forgetUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use the auth context easily
export const useAuth = () => useContext(AuthContext);