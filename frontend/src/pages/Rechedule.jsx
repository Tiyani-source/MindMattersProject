import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const Rechedule = () => {
  // -------------------- Routing & Context --------------------
  const navigate = useNavigate();
  const location = useLocation();
  const { therapistId } = useParams();

  const {
    therapist,
    token,
    getFormattedAvailability,
    rescheduleTherapistAppointment,
    getUserAppointments
  } = useContext(AppContext);

  // -------------------- State --------------------
  const [therapistInfo, setTherapistInfo] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [therapistSlots, setTherapistSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [appointmentType, setAppointmentType] = useState('');

  const appointmentId = location.state?.appointmentId;
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // -------------------- Fetch Therapist Info --------------------
  const fetchTherapistInfo = () => {
    console.log('Fetching therapist info for ID:', therapistId);
    console.log('Available therapists:', therapist);

    const info = therapist.find(t =>
      t._id === therapistId ||
      t._id?.toString() === therapistId?.toString()
    );

    if (info) {
      console.log('Found therapist:', info);
      setTherapistInfo(info);
    } else {
      console.error('Therapist not found');
      toast.error('Therapist information not found');
      navigate('/my-appointments');
    }
    setLoading(false);
  };

  // -------------------- Fetch & Format Availability --------------------
  const fetchAvailability = async () => {
    try {
      console.log('Fetching availability for therapist:', therapistInfo._id);
      const flat = await getFormattedAvailability(therapistInfo._id);
      console.log('Received availability:', flat);
      setAvailability(flat);
      generateSlots(flat);
    } catch (err) {
      console.error('Error fetching availability:', err);
      toast.error('Failed to load availability');
    }
  };

  const generateSlots = (flatSlots) => {
    const days = [];
    const now = new Date();
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      const formattedDate = currentDate.toISOString().split('T')[0];

      const slotMap = {};

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
          if (!slotMap[key]) {
            slotMap[key] = new Set();
          }
          slotMap[key].add(slot.type);
        }
      });

      const validSlots = Object.entries(slotMap)
        .map(([time, types]) => ({
          datetime: new Date(`${formattedDate}T${time}`),
          time,
          types: Array.from(types)
        }))
        .sort((a, b) => a.datetime - b.datetime);

      if (validSlots.length > 0) {
        days.push(validSlots);
      }
    }

    console.log('Filtered slots:', days);
    setTherapistSlots(days);
  };

  // -------------------- Reschedule Appointment --------------------
  const reschedule = async () => {
    if (!token) {
      toast.warning('Please login to reschedule');
      return navigate('/login');
    }

    if (!appointmentId) {
      toast.error('No appointment selected for rescheduling');
      return navigate('/my-appointments');
    }

    if (!selectedDate || !slotTime || !appointmentType) {
      toast.warning('Please select a date, time, and appointment type');
      return;
    }

    try {
      console.log('Rescheduling appointment:', {
        appointmentId,
        newDate: selectedDate,
        newTime: slotTime,
        typeOfAppointment: appointmentType
      });

      const result = await rescheduleTherapistAppointment({
        appointmentId,
        newDate: selectedDate,
        newTime: slotTime,
        typeOfAppointment: appointmentType
      });

      if (result.success) {
        toast.success('Appointment rescheduled successfully');
        await getUserAppointments(); // Refresh appointments list
        navigate('/my-appointments');
      } else {
        toast.error(result.message || 'Failed to reschedule appointment');
      }
    } catch (err) {
      console.error('Reschedule error:', err);
      toast.error('Failed to reschedule appointment');
    }
  };

  // -------------------- useEffect Hooks --------------------
  useEffect(() => {
    if (!appointmentId) {
      toast.error('No appointment selected for rescheduling');
      navigate('/my-appointments');
    }
  }, []);

  useEffect(() => {
    if (therapist.length > 0) {
      fetchTherapistInfo();
    }
  }, [therapist, therapistId]);

  useEffect(() => {
    if (therapistInfo) {
      fetchAvailability();
    }
  }, [therapistInfo]);

  // -------------------- Render --------------------
  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (!therapistInfo) {
    return <div className="text-center p-8">Therapist information not found</div>;
  }

  return (
    <div>
      <div className='flex flex-col sm:flex-row gap-4'>
        <div>
          <img
            className='bg-primary w-full sm:max-w-72 rounded-lg'
            src={therapistInfo.profilePicture || assets.profile_pic}
            alt={therapistInfo.name}
          />
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
        </div>
      </div>

      <div className='sm:ml-72 sm:pl-4 mt-8 font-medium text-[#565656]'>
        <p>Select New Time Slot</p>

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
              className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white' : 'border border-[#DDDDDD]'
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
                  className={`text-sm font-light px-5 py-2 rounded-full cursor-pointer transition w-fit text-center min-w-[64px] ${isSelected ? 'bg-primary text-white' : 'text-[#949494] border border-[#B4B4B4]'
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
          {['Online', 'In-Person'].map((type) => {
            const isAvailable = selectedDate && slotTime &&
              therapistSlots[slotIndex]?.find(slot =>
                slot.time === slotTime
              )?.types.includes(type);

            const isSelected = appointmentType === type.toLowerCase().replace('-', '');
            return isAvailable ? (
              <div
                key={type}
                onClick={() => setAppointmentType(type.toLowerCase().replace('-', ''))}
                className={`px-4 py-1 rounded-full border cursor-pointer text-sm transition ${isSelected
                  ? 'bg-primary text-white border-primary'
                  : 'text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
              >
                {type}
              </div>
            ) : (
              <div
                key={type}
                className='px-4 py-1 rounded-full border border-gray-200 text-sm text-gray-400 opacity-50 cursor-not-allowed'
              >
                {type}
              </div>
            );
          })}
        </div>

        {/* Reschedule Button */}
        <button
          onClick={reschedule}
          className='bg-primary text-white text-sm font-light px-20 py-3 rounded-full my-6'
        >
          Confirm Reschedule
        </button>
      </div>
    </div>
  );
};

export default Rechedule;
