import React, { createContext, useState, useContext } from 'react';

// Create the context
const AuthContext = createContext();

// Create a provider component
export function AuthProvider({ children }) {
    // Initialize state from local storage so it persists on refresh
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('avira_user');
        return storedUser ? JSON.parse(storedUser).user : null;
    });

    const saveUser = (userData) => {
        localStorage.setItem('avira_user', JSON.stringify(userData));
        setUser(userData.user);
    };

    const updateUserContext = (newDetails) => {
        const storedData = JSON.parse(localStorage.getItem('avira_user'));
        if (storedData && storedData.user) {
            // Merge existing user data with the new details
            const updatedUser = { ...storedData.user, ...newDetails };

            // Save the complete updated object back to storage
            const updatedStorage = { ...storedData, user: updatedUser };
            localStorage.setItem('avira_user', JSON.stringify(updatedStorage));

            // Update the React state
            setUser(updatedUser);
        }
    };

    const forgetUser = () => {
        localStorage.removeItem('avira_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isAdmin: user && user.userRole === 'admin',
            saveUser,
            updateUserContext,
            forgetUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use the auth context easily
export const useAuth = () => useContext(AuthContext);