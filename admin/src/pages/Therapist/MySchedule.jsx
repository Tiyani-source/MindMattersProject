import { useState, useContext, useEffect, useRef } from 'react';
import { TherapistContext } from '../../context/TherapistContext';
import { CalendarDays, Clock, Repeat, CheckCircle, Trash2, Edit2, X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ArrowDownCircle } from "lucide-react";
import RecurringSchedule from './RecurringSchedule';

const HEADER_HEIGHT = 88; // px, adjust if your header is a different height

const MySchedule = () => {
  const { availability, fetchAvailability, saveAvailability } = useContext(TherapistContext);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const getNext7Days = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
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

  const availableTimes = [
    "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"
  ];

  const [weekDays] = useState(getNext7Days());
  const [selectedDate, setSelectedDate] = useState(weekDays[0].date);
  const [selectedSlots, setSelectedSlots] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  useEffect(() => {
    if (availability && Object.keys(availability).length > 0) {
      setSelectedSlots({ ...availability });
      setHasChanges(false);
    }
  }, [availability]);

  const [activeTab, setActiveTab] = useState('regular');
  const [editingSlot, setEditingSlot] = useState(null); // {date, time, typeIdx}
  const [editType, setEditType] = useState('');
  const [agendaOpen, setAgendaOpen] = useState(false);
  const [expandedDates, setExpandedDates] = useState({});
  const agendaPanelRef = useRef(null);

  // When switching tabs, handle agenda visibility
  useEffect(() => {
    if (activeTab === 'regular') {
      setAgendaOpen(false); // Always collapsed by default on regular tab
    } else {
      setAgendaOpen(false); // Always hidden on recurring tab
    }
  }, [activeTab]);

  // --- Agenda logic ---
  const getAgendaListGroupedByTime = () => {
    // { date: { time: [ {type, isBooked}, ... ] } }
    const grouped = {};
    Object.entries(selectedSlots).forEach(([date, slots]) => {
      Object.entries(slots).forEach(([time, types]) => {
        const slotList = Array.isArray(types)
          ? types
          : typeof types === 'string'
            ? types.split(', ').map(type => ({ type, isBooked: false }))
            : [];
        if (!grouped[date]) grouped[date] = {};
        grouped[date][time] = slotList;
      });
    });
    // Sort times for each date
    Object.keys(grouped).forEach(date => {
      grouped[date] = Object.fromEntries(
        Object.entries(grouped[date]).sort(([a], [b]) => a.localeCompare(b))
      );
    });
    return grouped;
  };

  // Expand only today or the first date by default
  useEffect(() => {
    const grouped = getAgendaListGroupedByTime();
    const today = new Date().toISOString().split('T')[0];
    let initial = {};
    let found = false;
    Object.keys(grouped).forEach((date, i) => {
      if (!found && (date === today || i === 0)) {
        initial[date] = true;
        found = true;
      } else {
        initial[date] = false;
      }
    });
    setExpandedDates(initial);
  }, [Object.keys(selectedSlots).join(",")]);

  // Edit slot handlers
  const handleEditSlot = (date, time, idx, currentType) => {
    setEditingSlot({ date, time, idx });
    setEditType(currentType);
  };
  const handleSaveEditSlot = () => {
    if (!editingSlot) return;
    setSelectedSlots(prev => {
      const updated = { ...prev };
      const slotArr = [...updated[editingSlot.date][editingSlot.time]];
      slotArr[editingSlot.idx] = { ...slotArr[editingSlot.idx], type: editType };
      updated[editingSlot.date][editingSlot.time] = slotArr;
      setHasChanges(true);
      return updated;
    });
    setEditingSlot(null);
    setEditType('');
  };
  const handleDeleteSlot = (date, time, idx) => {
    setSelectedSlots(prev => {
      const updated = { ...prev };
      const slotArr = [...updated[date][time]];
      slotArr.splice(idx, 1);
      if (slotArr.length === 0) {
        delete updated[date][time];
      } else {
        updated[date][time] = slotArr;
      }
      setHasChanges(true);
      return updated;
    });
  };
  const handleCancelEdit = () => {
    setEditingSlot(null);
    setEditType('');
  };

  // Collapsible date groups
  const toggleDateExpand = (date) => {
    setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }));
  };

  // Show More logic
  const MAX_SLOTS_SHOWN = 4;
  const [showAllSlots, setShowAllSlots] = useState({});
  const handleShowMore = (date) => {
    setShowAllSlots(prev => ({ ...prev, [date]: true }));
  };

  // Jump to today
  const jumpToToday = () => {
    const today = new Date().toISOString().split('T')[0];
    if (agendaPanelRef.current) {
      const el = agendaPanelRef.current.querySelector(`[data-date='${today}']`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // --- Main schedule logic (unchanged) ---
  const toggleAvailability = (time, type) => {
    setSelectedSlots((prev) => {
      const daySlots = { ...(prev[selectedDate] || {}) };
      const currentSlotArray = Array.isArray(daySlots[time])
        ? [...daySlots[time]]
        : [];
      const index = currentSlotArray.findIndex(s => s.type === type);
      if (index !== -1) {
        if (!currentSlotArray[index].isBooked) {
          currentSlotArray.splice(index, 1);
        }
      } else {
        currentSlotArray.push({ type, isBooked: false });
      }
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

  // Remove a type from a time slot
  const handleRemoveTypeFromSlot = (date, time, type) => {
    setSelectedSlots(prev => {
      const updated = { ...prev };
      const slotArr = [...updated[date][time]];
      const newArr = slotArr.filter(s => s.type !== type);
      if (newArr.length === 0) {
        delete updated[date][time];
        if (Object.keys(updated[date]).length === 0) {
          delete updated[date];
        }
      } else {
        updated[date][time] = newArr;
      }
      setHasChanges(true);
      return updated;
    });
  };

  return (
    <div className="min-h-screen mt-10 flex flex-col bg-[#f7f8fa]">
      {/* Main Content with Agenda Side Panel */}
      <div className="flex flex-1 w-ful max-w-[1800px] mx-auto min-h-0" style={{ height: '870px' }}>
        {/* Main Schedule Section */}
        <main className={`flex-1 flex flex-col h-full min-h-0 bg-transparent transition-all duration-300 ${agendaOpen ? 'max-w-3xl' : 'max-w-5xl'}`}>
          <div className="flex-1 min-h-0 flex flex-col items-center justify-start">
            <div className={`w-full ${agendaOpen ? 'max-w-4xl' : 'max-w-6xl'} bg-white rounded-2xl shadow-xl px-5 pt-8 pb-2 flex flex-col h-full min-h-0 transition-all duration-300`}>
              {/* Integrated Tab Bar */}
              <div className="flex justify-center mb-4">
                <div className="inline-flex bg-gray-100 rounded-full p-1 shadow-sm">
                  <button
                    className={`px-6 py-2 rounded-full text-base font-semibold transition-all focus:outline-none ${activeTab === 'regular' ? 'bg-primary text-white shadow' : 'text-gray-700 hover:bg-gray-200'}`}
                    onClick={() => setActiveTab('regular')}
                  >
                    <CalendarDays className="w-5 h-5 inline-block mr-1" /> Regular
                  </button>
                  <button
                    className={`px-6 py-2 rounded-full text-base font-semibold transition-all focus:outline-none ${activeTab === 'recurring' ? 'bg-primary text-white shadow' : 'text-gray-700 hover:bg-gray-200'}`}
                    onClick={() => setActiveTab('recurring')}
                  >
                    <Repeat className="w-5 h-5 inline-block mr-1" /> Recurring
                  </button>
                </div>
              </div>
              {activeTab === 'regular' ? (
                <div className="w-full flex-1 min-h-0 flex flex-col">
                  {/* Header and Actions */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                    <div>
                      <h1 className="text-3xl font-bold text-primary mb-1">Weekly Availability</h1>
                      <p className="text-gray-500 text-base">Select your available slots for each day. Click to toggle availability.</p>
                    </div>
                    <div className="flex gap-2 mt-2 md:mt-0">
                      {activeTab === 'regular' && (
                        <button
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-primary transition-all text-sm font-medium shadow-sm"
                          onClick={() => setAgendaOpen(v => !v)}
                          style={{ minWidth: 120 }}
                        >
                          {agendaOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />} {agendaOpen ? 'Hide Agenda' : 'Show Agenda'}
                        </button>
                      )}
                      <button
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 focus:ring-2 focus:ring-red-300 transition-all text-sm font-medium shadow-sm"
                        onClick={() => {
                          setSelectedSlots(prev => ({ ...prev, [selectedDate]: {} }));
                          setHasChanges(true);
                        }}
                        disabled={Object.keys(selectedSlots[selectedDate] || {}).length === 0}
                        style={{ minWidth: 100 }}
                      >
                        <Trash2 className="w-4 h-4" /> Clear Day
                      </button>
                    </div>
                  </div>

                  {/* Weekly Calendar */}
                  <div className="flex justify-between gap-2 mb-6 overflow-x-auto">
                    {weekDays.map((day) => (
                      <button
                        key={day.date}
                        className={`flex flex-col items-center px-4 py-3 rounded-xl border transition-all min-w-[70px] text-base font-semibold shadow-sm ${selectedDate === day.date ? 'bg-primary text-white border-primary shadow-lg' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100 focus:ring-2 focus:ring-primary'}`}
                        onClick={() => setSelectedDate(day.date)}
                        style={{ outline: 'none' }}
                      >
                        <span className="mb-1">{day.dayName}</span>
                        <span className="text-2xl font-bold">{day.dayNum}</span>
                      </button>
                    ))}
                  </div>

                  {/* Time Slot Selection */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4 flex-1">
                    {availableTimes.map((time) => (
                      <div key={time} className="flex flex-col items-center bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                        <span className="text-lg font-semibold flex items-center text-gray-900 mb-3">
                          <Clock className="w-5 h-5 mr-2 text-primary" /> {time}
                        </span>
                        <div className="flex flex-col gap-2 w-full">
                          {["In-Person", "Online"].map((type) => {
                            const rawSlot = selectedSlots[selectedDate]?.[time];
                            const slotArray = Array.isArray(rawSlot)
                              ? rawSlot
                              : typeof rawSlot === 'string'
                                ? rawSlot.split(', ').map(type => ({ type, isBooked: false }))
                                : [];
                            const isBooked = slotArray.some(s => s.type === type && s.isBooked);
                            const isSelected = slotArray.some(s => s.type === type);
                            return (
                              <button
                                key={type}
                                className={`flex items-center justify-center w-full py-2 rounded-full text-sm font-medium border transition-all
                                  ${isBooked
                                    ? 'bg-red-100 text-red-500 border-red-200 cursor-not-allowed'
                                    : isSelected
                                      ? 'bg-primary text-white border-primary shadow'
                                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-primary hover:text-white focus:ring-2 focus:ring-primary'}
                                `}
                                disabled={isBooked}
                                onClick={() => toggleAvailability(time, type)}
                                style={{ outline: 'none' }}
                              >
                                {type}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Sticky Footer Action Bar */}
                  <div className="sticky bottom-0 left-0 z-30 flex flex-col w-full bg-white pt-4 pb-2 mt-2">
                    <div className="border-t border-gray-200 mb-2"></div>
                    <button
                      onClick={() => {
                        saveAvailability(selectedSlots);
                        setHasChanges(false);
                      }}
                      disabled={!hasChanges || !selectedDate}
                      className={`flex items-center gap-2 px-6 py-2 rounded-full text-base font-semibold shadow-md border border-primary bg-primary text-white hover:bg-[#FF6B6B] focus:ring-2 focus:ring-primary transition-all mx-auto
                        ${!hasChanges || !selectedDate ? 'opacity-60 cursor-not-allowed' : ''}`}
                      style={{ outline: 'none', minWidth: 220 }}
                    >
                      <CheckCircle className="w-5 h-5" /> Confirm Slots for the Day
                    </button>
                  </div>
                </div>
              ) : (
                <RecurringSchedule />
              )}
            </div>
          </div>
        </main>
        {/* Agenda Side Panel */}
        {activeTab === 'regular' && agendaOpen && (
          <aside className="w-[420px] bg-white border-l shadow-xl flex flex-col transition-all duration-300" style={{ height: '870px' }}>
            <div className="p-8 flex flex-col h-full min-h-0" style={{ height: '870px' }}>
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-7 h-7 text-primary" />
                  <h1 className="text-2xl font-bold text-primary">Agenda</h1>
                </div>
                <button className="p-2 rounded hover:bg-gray-100 focus:ring-2 focus:ring-primary" onClick={() => setAgendaOpen(false)} title="Hide Agenda" style={{ outline: 'none' }}>
                  <ChevronRight className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <button
                  className="flex items-center gap-1 px-3 py-1 rounded bg-primary text-white text-sm font-medium hover:bg-primary-dark focus:ring-2 focus:ring-primary transition-all"
                  onClick={jumpToToday}
                  style={{ outline: 'none' }}
                >
                  <ArrowDownCircle className="w-4 h-4" /> Jump to Today
                </button>
                <span className="text-gray-400 text-xs">(Collapse/expand dates as needed)</span>
              </div>
              <p className="text-gray-500 text-base mb-2">All your upcoming slots, grouped by date. Edit or remove slots as needed.</p>
              <div className="flex-1 min-h-0 overflow-y-auto max-h-full" ref={agendaPanelRef}>
                {Object.keys(getAgendaListGroupedByTime()).length === 0 ? (
                  <div className="text-center text-gray-400 py-12">No slots selected yet.</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {Object.entries(getAgendaListGroupedByTime()).map(([date, times]) => (
                      <div key={date} className="py-2" data-date={date}>
                        <div className="sticky top-0 bg-white z-10 flex items-center gap-2 pb-1 cursor-pointer select-none" onClick={() => toggleDateExpand(date)}>
                          <span className="text-lg font-bold text-primary">{date}</span>
                          {expandedDates[date] ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                        {expandedDates[date] && (
                          <div className="flex flex-col gap-1 mt-1 max-h-64 overflow-y-auto pr-1">
                            {Object.entries(times).map(([time, slotArr]) => (
                              <div key={time} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 shadow-sm mb-1">
                                <div className="flex items-center gap-3">
                                  <span className="text-md font-semibold text-gray-800 flex items-center"><Clock className="w-4 h-4 mr-1 text-primary" /> {time}</span>
                                  {slotArr.map((slot, idx) => (
                                    <span key={slot.type} className={`flex items-center text-sm px-3 py-1 rounded-full font-medium mr-2 ${slot.isBooked ? 'bg-red-500 text-white' : 'bg-primary text-white'}`}>
                                      {slot.type}
                                      {!slot.isBooked && (
                                        <button
                                          className="ml-2 text-white hover:text-red-200 focus:outline-none"
                                          title={`Remove ${slot.type}`}
                                          onClick={() => handleRemoveTypeFromSlot(date, time, slot.type)}
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      )}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Sticky Footer Save Bar */}
              <div className="sticky bottom-0 left-0 z-30 flex justify-center bg-transparent w-full pt-2 pb-2">
                <div className="pointer-events-auto bg-primary rounded-xl shadow-lg px-6 py-3 flex gap-2 items-center border border-primary w-fit mx-auto text-white text-base font-semibold hover:bg-[#FF6B6B] focus:ring-2 focus:ring-primary transition-all"
                  style={{ minWidth: 180 }}>
                  <button
                    onClick={() => {
                      saveAvailability(selectedSlots);
                      setHasChanges(false);
                    }}
                    disabled={!hasChanges}
                    className={`flex items-center gap-2 focus:outline-none ${!hasChanges ? 'opacity-60 cursor-not-allowed' : ''}`}
                    style={{ outline: 'none' }}
                  >
                    <CheckCircle className="w-5 h-5" /> Save Changes
                  </button>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default MySchedule;