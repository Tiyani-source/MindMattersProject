import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'

const Appointment = () => {

    // -------------------- Routing & Context --------------------
  const { therapistId } = useParams();
  const navigate = useNavigate();
  const {
    therapist,
    token,
    userData,
    currencySymbol,
    getFormattedAvailability,
    bookTherapistAppointment
  } = useContext(AppContext);

  // -------------------- State --------------------
  const [therapistInfo, setTherapistInfo] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [therapistSlots, setTherapistSlots] = useState([]);

  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [appointmentType, setAppointmentType] = useState('');

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // -------------------- Fetch Therapist Info --------------------
  const fetchTherapistInfo = () => {
    const info = therapist.find((t) => t._id === therapistId);
    setTherapistInfo(info);
  };

  // -------------------- Fetch & Format Availability --------------------
  const fetchAvailability = async () => {
    const flat = await getFormattedAvailability(therapistId);
    setAvailability(flat);
    generateSlots(flat);
  };

  const generateSlots = (flatSlots) => {
    const days = [];
    const now = new Date();
    const today = new Date();
  
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      const formattedDate = currentDate.toISOString().split('T')[0];
  
      const slotsMap = {};
  
      flatSlots.forEach(slot => {
        const slotDateTime = new Date(`${slot.date}T${slot.time}`);
        const isToday = slot.date === now.toISOString().split("T")[0];
        const isFutureSlot = !isToday || slotDateTime.getTime() >= now.getTime() + 30 * 60 * 1000;
  
        if (
          slot.date === formattedDate &&
          isFutureSlot &&
          !slot.isBooked
        ) {
          const key = slot.time;
          if (!slotsMap[key]) {
            slotsMap[key] = { time: slot.time, types: [slot.type] };
          } else if (!slotsMap[key].types.includes(slot.type)) {
            slotsMap[key].types.push(slot.type);
          }
        }
      });
  
      // Only keep slots that have BOTH Online and In-Person types
      const validSlots = Object.values(slotsMap).filter(slot =>
        slot.types.includes("Online") && slot.types.includes("In-Person")
      ).map(slot => ({
        datetime: new Date(`${formattedDate}T${slot.time}`),
        time: slot.time,
        types: slot.types
      })).sort((a, b) => a.datetime - b.datetime);;
  
      if (validSlots.length > 0) days.push(validSlots);
    }
  
    setTherapistSlots(days);
  };

  // -------------------- Booking an Appointment --------------------
  const bookAppointment = async () => {
    if (!token) {
      toast.warning('Login to book appointment');
      return navigate('/login');
    }
  
    if (!selectedDate || !slotTime || !appointmentType) {
      toast.warning('Please select a date, time, and appointment type');
      return;
    }
  
    const res = await bookTherapistAppointment({
      therapistID: therapistId,
      clientID: userData._id,
      date: selectedDate,
      time: slotTime,
      typeOfAppointment: appointmentType,
      meetingLink: appointmentType === 'online' ? ' ' : ''
    });
  
    if (res.success) {
      toast.success('Appointment booked successfully');
      await fetchAvailability();
      navigate('/my-appointments');
    } else {
      toast.error(res.message);
    }
  };

  // -------------------- useEffect Hooks --------------------
  useEffect(() => {
    if (therapist.length > 0) {
      fetchTherapistInfo();
    }
  }, [therapist]);

  useEffect(() => {
    if (therapistInfo) {
      fetchAvailability();
    }
  }, [therapistInfo]);

  // -------------------- Debugging Logs --------------------
  useEffect(() => {
    console.log("therapistId from URL:", therapistId);
  }, [therapistId]);

  useEffect(() => {
    console.log("Therapist Info loaded:", therapistInfo);
  }, [therapistInfo]);

  useEffect(() => {
    console.log("Availability fetched:", availability);
  }, [availability]);

  // -------------------- Render --------------------
  if (!therapistInfo) {
    console.log("Therapist info not loaded");
    return <div>Loading therapist info...</div>;
  }

  return (
  <div>
    <div className='flex flex-col sm:flex-row gap-4'>
      <div>
        <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={therapistInfo.image} alt='' />
      </div>

      <div className='flex-1 border border-[#ADADAD] rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
        <p className='flex items-center gap-2 text-3xl font-medium text-gray-700'>
          {therapistInfo.name}
          <img className='w-5' src={assets.verified_icon} alt='Verified' />
        </p>
        <div className='flex items-center gap-2 mt-1 text-gray-600'>
          <p>{therapistInfo.degree} - {therapistInfo.speciality}</p>
          <button className='py-0.5 px-2 border text-xs rounded-full'>{therapistInfo.experience} yrs</button>
        </div>

        <p className='text-sm text-gray-600 mt-3'>{therapistInfo.about}</p>
        <p className='text-gray-600 font-medium mt-4'>
          Appointment fee: <span className='text-gray-800'>{currencySymbol}{therapistInfo.fees}</span>
        </p>
      </div>
    </div>

    <div className='sm:ml-72 sm:pl-4 mt-8 font-medium text-[#565656]'>
      <p>Booking slots</p>

      {/* Slot Days */}
      <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
        {therapistSlots.length > 0 && therapistSlots.map((daySlots, index) => (
          <div
          onClick={() => {
            setSlotIndex(index);
            setSlotTime('');
            setSelectedDate('');
            setAppointmentType('');
                }}
                  key={index}
                  className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${
                    slotIndex === index ? 'bg-primary text-white' : 'border border-[#DDDDDD]'
                  }`}
                >
                  <p>{daysOfWeek[daySlots[0].datetime.getDay()]}</p>
                  <p>{daySlots[0].datetime.getDate()}</p>
                </div>
              ))}
            </div>

      {/* Time Slots */}
      <div className='flex items-center gap-3 w-full overflow-x-auto mt-4'>
        {therapistSlots[slotIndex]?.map((slot, i) => {
          const isSelected = slot.time === slotTime;
          return (
            <div key={i}>
              <div
                onClick={() => {
                  setSlotTime(slot.time);
                  setSelectedDate(slot.datetime.toISOString().split('T')[0]);
                  setAppointmentType('');
                }}
                className={`text-sm font-light px-5 py-2 rounded-full cursor-pointer transition w-fit text-center min-w-[64px] ${
                  isSelected ? 'bg-primary text-white' : 'text-[#949494] border border-[#B4B4B4]'
                }`}
              >
                {slot.time}
              </div>
            </div>
          );
        })}
      </div>

      {/* Appointment Type Selection */}
      <div className='flex gap-4 mt-4 ml-1'>
      {['online', 'inperson'].map((type) => {
  const apiType = type === 'inperson' ? 'In-Person' : 'Online';
          const isAvailable = availability.some(
            (slot) =>
              slot.date === selectedDate &&
              slot.time === slotTime &&
              slot.type === apiType &&
              !slot.isBooked
          );

          const isSelected = appointmentType === type;
          console.log("Booking with typeOfAppointment:", appointmentType);
          return isAvailable ? (
            <div
              key={type}
              onClick={() => setAppointmentType(type)}
              className={`px-4 py-1 rounded-full border cursor-pointer text-sm transition ${
                isSelected
                  ? 'bg-primary text-white border-primary'
                  : 'text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              {type === 'online' ? 'Online' : 'In-Person'}
            </div>
          ) : (
            <div
              key={type}
              className='px-4 py-1 rounded-full border border-gray-200 text-sm text-gray-400 opacity-50 cursor-not-allowed'
            >
              {type === 'online' ? 'Online' : 'In-Person'}
            </div>
          );
        })}
      </div>

      {/* Book Button */}
      <button
        onClick={bookAppointment}
        className='bg-primary text-white text-sm font-light px-20 py-3 rounded-full my-6'
      >
        Book an appointment
      </button>
    </div>
  </div>
);
}

export default Appointment