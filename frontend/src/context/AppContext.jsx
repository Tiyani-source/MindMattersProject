import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from 'axios'

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currencySymbol = 'LKR'
    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [doctors, setDoctors] = useState([])
    const [therapist, setTherapist] = useState([])
    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '')
    const [userData, setUserData] = useState(false)


    const getTherapistData= async () => {

        try {

            const { data } = await axios.get(backendUrl + '/api/therapist/list')
            if (data.success) {
                setTherapist(data.therapists)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }

    }

    const [therapistAvailability, setTherapistAvailability] = useState([]);

    const getTherapistAvailability = async (therapistID) => {
    try {
        const { data } = await axios.get(`${backendUrl}/api/therapist/availability/${therapistID}`);
        if (data.success) {
        setTherapistAvailability(data.availability);
        }
    } catch (error) {
        console.log(error);
    }
    };
    
    const getFormattedAvailability = async (therapistId) => {
      try {
        const { data } = await axios.post(
          `${backendUrl}/api/therapist/get-availability`,
          { therapistId },
          { headers: { token } }
        );
    
        if (data.success) {
          const flat = [];
          Object.keys(data.availability).forEach(date => {
            Object.keys(data.availability[date]).forEach(time => {
              const slotArr = data.availability[date][time];
    
              // Make sure it's an array
              if (Array.isArray(slotArr)) {
                slotArr.forEach(slot => {
                  flat.push({ date, time, type: slot.type, isBooked: slot.isBooked });
                });
              }
            });
          });
          return flat;
        } else {
          toast.error('Failed to load availability');
          return [];
        }
      } catch (err) {
        console.error(err);
        toast.error('Error loading availability');
        return [];
      }
    };
      
      const bookTherapistAppointment = async ({
        therapistID,
        clientID,
        date,
        time,
        typeOfAppointment,
        meetingLink
      }) => {
        try {
          const res = await axios.post(
            `${backendUrl}/api/user/book-therapist`,
            {
              therapistID,
              clientID,
              date,
              time,
              typeOfAppointment,
              meetingLink
            },
            { headers: { token } }
          );
      
          return res.data;
        } catch (err) {
          console.error(err);
          toast.error('Booking failed');
          return { success: false, message: err.message };
        }
      };
      const rescheduleTherapistAppointment = async ({
        appointmentId,
        newDate,
        newTime,
        typeOfAppointment
      }) => {
        try {
          const res = await axios.post(
            `${backendUrl}/api/user/reschedule-appointment`,
            {
              appointmentId,
              newDate,
              newTime,
              typeOfAppointment
            },
            { headers: { token } }
          );
          return res.data;
        } catch (err) {
          toast.error("Failed to reschedule appointment");
          return { success: false, message: err.message };
        }
      };

      const confirmCancellation = async (appointmentId) => {
        try {
          const res = await fetch(`${backendUrl}/api/user/cancel-appointment`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              token
            },
            body: JSON.stringify({ appointmentId })
          });
      
          const data = await res.json();
          if (data.success) {
            toast.success(data.message);
            getUserAppointments(); // refresh list
          } else {
            toast.error(data.message);
          }
        } catch (err) {
          console.error(err);
          toast.error("Cancellation failed");
        }
      };
    // Getting Doctors using API
    const getDoctosData = async () => {

        try {

            const { data } = await axios.get(backendUrl + '/api/doctor/list')
            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }

    }
    const [appointments, setAppointments] = useState([]);

    const getUserAppointments = async () => {
      try {
        const { data } = await axios.get(backendUrl + '/api/user/appointments/therapists', {
              headers: { token }
          });
          console.log("Fetched appointment data:", data);
          if (data.success) {
              setAppointments(data.appointments);
          } else {
              console.error("Failed to fetch appointments:", data.message);
              toast.error(data.message);
          }
      } catch (error) {
          console.error("Network or API error fetching appointments:", error);
          toast.error(error.message);
      }
  };

    // Getting User Profile using API
    const loadUserProfileData = async () => {

        try {

            const { data } = await axios.get(backendUrl + '/api/user/get-profile', { headers: { token } })

            if (data.success) {
                setUserData(data.userData)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }

    }

    const handleViewMeetingClick = async (appointmentId) => {
      try {
        const res = await fetch(`${backendUrl}/api/user/meeting-link`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            token
          },
          body: JSON.stringify({ appointmentId })
        });
    
        const data = await res.json();
        if (data.success) {
          return data.meetingLink; 
        } else {
          toast.error(data.message);
          return null;
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load meeting link");
        return null;
      }
    };

    useEffect(() => {
        getDoctosData()
        getTherapistData()
    }, [])

    useEffect(() => {
        if (token) {
            loadUserProfileData()
        }
    }, [token])

    const value = {
        doctors, getDoctosData,
        therapist, getTherapistData,
        currencySymbol,
        backendUrl,
        token, setToken,
        userData, setUserData, loadUserProfileData,
        appointments, getUserAppointments,
        therapistAvailability, getTherapistAvailability,
        getFormattedAvailability,
        bookTherapistAppointment,
        rescheduleTherapistAppointment,
        confirmCancellation,
        handleViewMeetingClick
      };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}

export default AppContextProvider