import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [custID, setCustID] = useState(null);
  const [cart, setCart] = useState([]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, custID, setCustID, cart, setCart }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);