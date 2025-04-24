import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';
import RelatedDoctors from '../components/RelatedDoctors';

const TherapistAppointment = () => {
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
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      const formattedDate = currentDate.toISOString().split('T')[0];

      const slots = flatSlots
        .filter(slot => slot.date === formattedDate && !slot.isBooked)
        .map(slot => ({
          datetime: new Date(`${slot.date}T${slot.time}`),
          time: slot.time
        }));

      if (slots.length > 0) days.push(slots);
    }

    setTherapistSlots(days);
  };

  // -------------------- Book Appointment --------------------
  const bookAppointment = async () => {
    if (!token) {
      toast.warning('Login to book appointment');
      return navigate('/login');
    }

    const res = await bookTherapistAppointment({
      therapistID: therapistId,
      clientID: userData._id,
      date: selectedDate,
      time: slotTime,
      typeOfAppointment: appointmentType,
      meetingLink: appointmentType === 'online' ? 'https://zoom.us/meeting/xyz' : ''
    });

    if (res.success) {
      toast.success('Appointment booked successfully');
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
            onClick={() => setSlotIndex(index)}
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
      <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
        {therapistSlots[slotIndex]?.map((slot, i) => (
          <p
            key={i}
            onClick={() => {
              setSlotTime(slot.time);
              setSelectedDate(slot.datetime.toISOString().split('T')[0]);
            }}
            className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${
              slot.time === slotTime ? 'bg-primary text-white' : 'text-[#949494] border border-[#B4B4B4]'
            }`}
          >
            {slot.time}
          </p>
        ))}
      </div>

      {/* Appointment Type Selection */}
      <div className='mt-4'>
        {['Online', 'In-Person'].map((type) => {
          const isAvailable = availability.some(slot =>
            slot.date === selectedDate &&
            slot.time === slotTime &&
            slot.type.toLowerCase() === type.toLowerCase() &&
            !slot.isBooked
          );

          return (
            <label key={type} className='mr-4'>
              <input
                type='radio'
                name='appointmentType'
                value={type.toLowerCase()}
                disabled={!isAvailable}
                onChange={(e) => setAppointmentType(e.target.value)}
              />{' '}
              {type}
            </label>
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

    <RelatedDoctors
      speciality={therapistInfo.speciality}
      therapistId={therapistId}
    />
  </div>
);
};

export default TherapistAppointment;