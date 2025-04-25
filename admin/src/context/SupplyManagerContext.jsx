import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const SupplyManagerContext = createContext();

export const SupplyManagerProvider = ({ children }) => {
  const [smToken, setSMToken] = useState(localStorage.getItem('smToken') || '');
  const [supplyManager, setSupplyManager] = useState(null);
  const [supplyManagerLoading, setSupplyManagerLoading] = useState(false);
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch supply manager data when token changes
  useEffect(() => {
    const fetchSupplyManagerData = async () => {
      if (!smToken) {
        setSupplyManager(null);
        return;
      }

      try {
        setSupplyManagerLoading(true);
        const { data } = await axios.get(`${backendUrl}/api/supplymanager/profile`, {
          headers: {
            Authorization: `Bearer ${smToken}`
          }
        });

        if (data.success) {
          setSupplyManager(data.supplyManager);
        } else {
          // Handle invalid token
          localStorage.removeItem('smToken');
          setSMToken('');
          setSupplyManager(null);
        }
      } catch (error) {
        console.error('Error fetching supply manager data:', error);
        localStorage.removeItem('smToken');
        setSMToken('');
        setSupplyManager(null);
      } finally {
        setSupplyManagerLoading(false);
      }
    };

    fetchSupplyManagerData();
  }, [smToken, backendUrl]);

  // Logout function
  const logoutSupplyManager = () => {
    localStorage.removeItem('smToken');
    setSMToken('');
    setSupplyManager(null);
  };

  // Check if supply manager is authenticated
  const isSupplyManagerAuthenticated = () => {
    return !!smToken && !!supplyManager;
  };

  return (
    <SupplyManagerContext.Provider
      value={{
        smToken,
        setSMToken,
        supplyManager,
        supplyManagerLoading,
        logoutSupplyManager,
        isSupplyManagerAuthenticated
      }}
    >
      {children}
    </SupplyManagerContext.Provider>
  );
};

export default SupplyManagerProvider;