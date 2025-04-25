import { createContext, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';

export const UniversityContext = createContext();

const UniversityContextProvider = (props) => {

    console.log("In universityContext.jsx...");
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [uToken, setUToken] = useState(localStorage.getItem('uToken') ? localStorage.getItem('uToken') : '');
    const [courses, setCourses] = useState([]);
    const [dashData, setDashData] = useState(false);
    const [profileData, setProfileData] = useState(false);

    // Fetching courses from database using API
    const getCourses = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/university/courses`, { headers: { uToken } });
            if (data.success) {
                setCourses(data.courses.reverse());
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    // Fetching University profile data using API
    const getProfileData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/university/profile`, { headers: { uToken } });
            console.log(data.profileData);
            setProfileData(data.profileData);
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    // Function to cancel course enrollment using API
    const cancelEnrollment = async (enrollmentId) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/university/cancel-enrollment`, { enrollmentId }, { headers: { uToken } });
            if (data.success) {
                toast.success(data.message);
                getCourses();
                getDashData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
            console.log(error);
        }
    };

    // Function to complete course enrollment using API
    const completeEnrollment = async (enrollmentId) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/university/complete-enrollment`, { enrollmentId }, { headers: { uToken } });
            if (data.success) {
                toast.success(data.message);
                getCourses();
                getDashData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
            console.log(error);
        }
    };

    // Fetching University dashboard data using API
    const getDashData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/university/dashboard`, { headers: { uToken } });
            if (data.success) {
                setDashData(data.dashData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const value = {
        uToken, setUToken, backendUrl,
        courses, getCourses,
        cancelEnrollment,
        completeEnrollment,
        dashData, getDashData,
        profileData, setProfileData,
        getProfileData,
    };

    return (
        <UniversityContext.Provider value={value}>
            {props.children}
        </UniversityContext.Provider>
    );
};

export default UniversityContextProvider;
