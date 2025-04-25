import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const currencySymbol = "$";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [doctors, setDoctors] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [userData, setUserData] = useState(null);

 
  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/list");

      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch doctors");
    }
  };


  const loadUserProfileData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/student/profile`, {
        headers: { token },
      });
  
      console.log("DEBUG: /student/profile response =>", data); // 👈 Add this
  
      if (data.success) {
        // Temporarily log all possible keys
        setUserData(
          data.student || data.userData || data.user || null
        );
      } else {
        toast.error(data.message || "Failed to load user profile");
      }
    } catch (error) {
      console.error("Profile load error:", error);
      toast.error("Error loading profile");
    }
  };
  


  useEffect(() => {
    getDoctorsData();
  }, []);

  
  useEffect(() => {
    if (token) {
      loadUserProfileData();
    } else {
      setUserData(null); // clear on logout
    }
  }, [token]);

  const value = {
    doctors,
    getDoctorsData,
    currencySymbol,
    backendUrl,
    token,
    setToken,
    userData,
    setUserData,
    loadUserProfileData,
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
