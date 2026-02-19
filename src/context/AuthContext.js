import { createContext, useContext, useState, useEffect } from 'react';
import { getUserData, setUserData as persistUserData, clearUserData } from '../Dashboard/dashboardService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = getUserData();
    if (stored) {
      setUser(stored);
    }
  }, []);

  const setUserAndPersist = (data) => {
    if (data) {
      persistUserData(data);
      setUser(data);
    } else {
      clearUserData();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser: setUserAndPersist }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
