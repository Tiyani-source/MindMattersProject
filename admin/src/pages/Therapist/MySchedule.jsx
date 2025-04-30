import { useState, useContext, useEffect } from 'react';
import { TherapistContext } from '../../context/TherapistContext';
import { CalendarDays, Clock } from "lucide-react";


const MySchedule = () => {

    const { availability, fetchAvailability, saveAvailability } = useContext(TherapistContext);

    useEffect(() => {
        fetchAvailability();
    }, []);

    const getNext7Days = () => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1); // Start from tomorrow
      
        return [...Array(7)].map((_, i) => {
          const day = new Date(tomorrow);
          day.setDate(tomorrow.getDate() + i);
          return {
            date: day.toISOString().split("T")[0],
            dayName: day.toLocaleDateString("en-US", { weekday: "short" }),
            dayNum: day.getDate(),
          };
        });
      };

      
    const availableTimes = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00" ];

    const [weekDays] = useState(getNext7Days());
    const [selectedDate, setSelectedDate] = useState(weekDays[0].date);
    const [selectedSlots, setSelectedSlots] = useState({});
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (availability && Object.keys(availability).length > 0) {
            setSelectedSlots({ ...availability });
            setHasChanges(false); // Reset changes when availability is fetched
        }
    }, [availability]);

    const [showAgenda, setShowAgenda] = useState(false);

    const toggleAvailability = (time, type) => {
        setSelectedSlots((prev) => {
          const daySlots = { ...(prev[selectedDate] || {}) };
          const currentSlotArray = Array.isArray(daySlots[time])
            ? [...daySlots[time]]
            : [];
      
          // Check if this type already exists
          const index = currentSlotArray.findIndex(s => s.type === type);
      
          if (index !== -1) {
            // Remove slot if it's not booked
            if (!currentSlotArray[index].isBooked) {
              currentSlotArray.splice(index, 1);
            }
          } else {
            // Add new slot
            currentSlotArray.push({ type, isBooked: false });
          }
      
          // Update or remove the time slot
          if (currentSlotArray.length > 0) {
            daySlots[time] = currentSlotArray;
          } else {
            delete daySlots[time];
          }
      
          setHasChanges(true);
      
          return {
            ...prev,
            [selectedDate]: daySlots,
          };
        });
      };

    return (
        <div className="w-full h-screen p-8 bg-gradient-to-b from-light-gray to-white flex flex-col items-center">
        

          <h2 className="text-4xl font-bold mb-4 flex items-center text-primary">
            <CalendarDays className="w-7 h-7 mr-3" /> My Weekly Availability
          </h2>
          <h2 className="text-lg font-thin mb-4">Please select on the time slots you are available for each day and click to confirm each days schedule.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-[90%] mx-auto h-fit mb-10">
            {/* LEFT: Date and Time Selection */}
            <div className="col-span-2 p-6 bg-white shadow-xl rounded-2xl h-full">
              <div className="flex justify-center space-x-4 mb-8 overflow-x-auto pb-4">
                {weekDays.map((day) => (
                  <button
                    key={day.date}
                    className={`px-6 py-4 rounded-lg text-base font-semibold transition-all shadow-md ${
                      selectedDate === day.date ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => setSelectedDate(day.date)}
                  >
                    {day.dayName} <br />
                    <span className="text-lg font-bold">{day.dayNum}</span>
                  </button>
                ))}
              </div>
      
              {/* Time Slot Selection */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {availableTimes.map((time) => (
                  <div key={time} className="flex flex-col items-center border rounded-2xl p-5 bg-white shadow-lg hover:shadow-xl transition-all w-full">
                    <span className="text-lg font-semibold flex items-center text-gray-900">
                      <Clock className="w-5 h-5 mr-2 text-primary" /> {time}
                    </span>
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {["In-Person", "Online"].map((type) => {
                        const rawSlot = selectedSlots[selectedDate]?.[time];
                        const slotArray = Array.isArray(rawSlot)
                          ? rawSlot
                          : typeof rawSlot === 'string'
                            ? rawSlot.split(', ').map(type => ({ type, isBooked: false }))
                            : [];

                        const isBooked = slotArray.some(s => s.type === type && s.isBooked);
                        const isAnyBooked = slotArray.some(s => s.isBooked);
                        const isSelected = slotArray.some(s => s.type === type);

                        return (
                            <label key={type} className="cursor-pointer">
                            <input
                                type="checkbox"
                                className="hidden"
                                disabled={isBooked} // 🔒 Disable both if any type is booked
                                onChange={() => toggleAvailability(time, type)}
                                checked={isSelected}
                            />
                        <span
                        className={`px-4 py-2 w-24 text-center rounded-full text-sm font-medium block transition-all ${
                            isBooked
                            ? 'bg-red-200 text-red-700 cursor-not-allowed'
                            : isSelected
                            ? 'bg-primary text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        >
                        {type}
                        </span>
                            </label>
                        );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
      
            {/* RIGHT: Agenda View */}
            <div className="p-6 bg-white shadow-xl rounded-2xl h-full flex flex-col justify-start">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <CalendarDays className="w-5 h-5 mr-2 text-primary" /> Selected Schedule
              </h3>
      
              {!showAgenda ? (
                Object.keys(selectedSlots[selectedDate] || {}).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(selectedSlots[selectedDate] || {})
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([time, slotArray]) => (
                            <div key={time} className="flex justify-between items-center p-4 bg-light-gray rounded-lg shadow-sm">
                            <span className="text-md font-semibold text-gray-800">{time}</span>
                            <div className="flex flex-wrap gap-2">
                            {(() => {
                                    const slotList = Array.isArray(slotArray)
                                        ? slotArray
                                        : typeof slotArray === "string"
                                        ? slotArray.split(", ").map(type => ({ type, isBooked: false }))
                                        : [];

                                    const isAnyBooked = slotList.some(s => s.isBooked);

                                    return isAnyBooked ? (
                                        <span className="text-sm px-3 py-1 rounded-full bg-red-500 text-white">
                                        Slot Booked
                                        </span>
                                    ) : (
                                        slotList.map((s, idx) => (
                                        <span key={idx} className="text-sm px-3 py-1 rounded-full bg-primary text-white">
                                            {s.type}
                                        </span>
                                        ))
                                    );
                                    })()}
                            </div>
                            </div>
                        ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center p-4 bg-light-gray rounded-lg shadow-sm">
                    ❌ Availability Slots Not Selected for the Day.<br />
                    Clients will not be able to schedule appointments with you today.
                  </p>
                )
              ) : null}
      
              {!showAgenda && (
                <button
                  onClick={() => {
                    saveAvailability(selectedSlots);
                    setHasChanges(false);
                  }}
                  disabled={!hasChanges || !selectedDate}
                  className={`w-full py-3 rounded-xl shadow-md transition-all ${
                    !hasChanges || !selectedDate
                      ? "bg-primary text-white hover:opacity-60 cursor-not-allowed"
                      : "bg-primary text-white hover:bg-[#FF6B6B]"
                  }`}
                >
                  Confirm Slots for the Day
                </button>
              )}
      
              <button
                onClick={() => setShowAgenda(!showAgenda)}
                className={`mt-2 w-full py-3 rounded-xl shadow-md transition-all border-2 ${
                  showAgenda
                    ? "bg-[#4C5AE3] text-white border-[#4C5AE3] opacity-90 hover:opacity-60"
                    : "bg-white text-[#4C5AE3] border-[#4C5AE3] hover:bg-[#4C5AE3] hover:text-white hover:opacity-60"
                }`}
              >
                {showAgenda ? "See Selected Slots for the Day" : "View My Selected Agenda"}
              </button>
      
              {/* Full Agenda View */}
              {showAgenda && (
                <div className="mt-2 p-4 bg-white shadow-lg rounded-xl max-h-[600px] overflow-y-auto">
                  <h4 className="text-lg font-bold text-gray-900">My Selected Agenda</h4>
                  {Object.keys(selectedSlots).length > 0 ? (
                    <div className="mt-2 space-y-3">
                      {Object.entries(selectedSlots).map(([date, slots]) => (
                        <div key={date} className="p-3 border border-gray-300 rounded-lg">
                          <h5 className="text-md font-semibold text-primary">{date}</h5>
                          {Object.entries(slots)
                            .sort(([a], [b]) => a.localeCompare(b))
                            .map(([time, types]) => (
                              <div key={time} className="flex justify-between items-center p-2 bg-light-gray rounded-lg shadow-sm">
                                <span className="text-md font-semibold text-gray-800">{time}</span>
                                <div className="flex flex-wrap gap-2">
                                  {(() => {
                                    const slotList = Array.isArray(types)
                                      ? types
                                      : typeof types === "string"
                                      ? types.split(", ").map(type => ({ type, isBooked: false }))
                                      : [];

                                    const isAnyBooked = slotList.some(s => s.isBooked);

                                    return isAnyBooked ? (
                                      <span className="text-sm px-3 py-1 rounded-full bg-red-500 text-white">
                                        Slot Booked
                                      </span>
                                    ) : (
                                      slotList.map((s, idx) => (
                                        <span key={idx} className="text-sm px-3 py-1 rounded-full bg-primary text-white">
                                          {s.type}
                                        </span>
                                      ))
                                    );
                                  })()}
                                </div>
                              </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center p-4 bg-light-gray rounded-lg shadow-sm">
                      No slots selected yet.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
};

export default MySchedule;