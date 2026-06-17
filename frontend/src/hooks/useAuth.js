import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
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
      const updatedUser = { ...storedData.user, ...newDetails };

      const updatedStorage = { ...storedData, user: updatedUser };
      localStorage.setItem('avira_user', JSON.stringify(updatedStorage));

      setUser(updatedUser);
    }
  };

  const forgetUser = () => {
    localStorage.removeItem('avira_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user && user.userRole === 'admin',
        saveUser,
        updateUserContext,
        forgetUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
