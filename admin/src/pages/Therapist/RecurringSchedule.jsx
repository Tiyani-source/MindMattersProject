import { useState, useContext, useEffect } from 'react';
import { TherapistContext } from '../../context/TherapistContext';
import { CalendarDays, Clock, Repeat, Calendar, X, Check, Coffee, Utensils, User, Edit2, ChevronRight } from "lucide-react";
import { toast } from 'react-toastify';

const RecurringSchedule = () => {
    const {
        saveRecurringAvailability,
        fetchRecurringSchedules,
        recurringSchedules,
        deleteRecurringSchedule,
        updateRecurringSchedule
    } = useContext(TherapistContext);

    const [activeTab, setActiveTab] = useState('existing'); // 'existing' or 'new'
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchRecurringSchedules();
    }, []);

    const defaultBreaks = [
        { start: "13:00", end: "14:00", label: "Lunch Break" },
        { start: "17:00", end: "18:00", label: "Human Break" }
    ];

    const emptySchedule = {
        name: "",
        days: [],
        startTime: "09:00",
        endTime: "21:00",
        interval: 60,
        types: ["In-Person", "Online"],
        startDate: new Date().toISOString().split('T')[0],
        endDate: null,
        breaks: defaultBreaks
    };

    const [recurringSchedule, setRecurringSchedule] = useState(emptySchedule);
    const [newBreak, setNewBreak] = useState({ start: '', end: '', label: '' });
    const [isAddingBreak, setIsAddingBreak] = useState(false);

    const [selectedSlots, setSelectedSlots] = useState({});

    const daysOfWeek = [
        { value: 0, label: "Sunday" },
        { value: 1, label: "Monday" },
        { value: 2, label: "Tuesday" },
        { value: 3, label: "Wednesday" },
        { value: 4, label: "Thursday" },
        { value: 5, label: "Friday" },
        { value: 6, label: "Saturday" },
    ];

    const generateTimeSlots = () => {
        const slots = [];
        let currentTime = new Date();
        currentTime.setHours(8, 0, 0); // Start at 8 AM
        const endTime = new Date();
        endTime.setHours(20, 0, 0); // End at 8 PM

        while (currentTime <= endTime) {
            const timeString = currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
            slots.push(timeString);
            currentTime.setMinutes(currentTime.getMinutes() + 30);
        }
        return slots;
    };

    const [previewDay, setPreviewDay] = useState(new Date().getDay());
    const [generatedSlots, setGeneratedSlots] = useState([]);

    const generatePreviewSlots = () => {
        if (!recurringSchedule.startTime || !recurringSchedule.endTime || !recurringSchedule.interval) {
            return [];
        }

        const slots = [];
        const [startHour, startMinute] = recurringSchedule.startTime.split(':').map(Number);
        const [endHour, endMinute] = recurringSchedule.endTime.split(':').map(Number);

        let currentTime = new Date();
        currentTime.setHours(startHour, startMinute, 0);

        const endTime = new Date();
        endTime.setHours(endHour, endMinute, 0);

        while (currentTime < endTime) {
            const timeString = currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });

            // Check if time is within any break
            const isBreakTime = recurringSchedule.breaks.some(breakTime => {
                const [breakStartHour, breakStartMinute] = breakTime.start.split(':').map(Number);
                const [breakEndHour, breakEndMinute] = breakTime.end.split(':').map(Number);
                const timeInMinutes = startHour * 60 + startMinute;
                const breakStartInMinutes = breakStartHour * 60 + breakStartMinute;
                const breakEndInMinutes = breakEndHour * 60 + breakEndMinute;
                return timeInMinutes >= breakStartInMinutes && timeInMinutes < breakEndInMinutes;
            });

            if (!isBreakTime) {
                slots.push({
                    time: timeString,
                    types: recurringSchedule.types
                });
            }

            // Add interval minutes
            currentTime.setMinutes(currentTime.getMinutes() + recurringSchedule.interval);
        }

        return slots;
    };

    useEffect(() => {
        if (recurringSchedule.days.includes(previewDay)) {
            const slots = generatePreviewSlots();
            setGeneratedSlots(slots);
        } else {
            setGeneratedSlots([]);
        }
    }, [recurringSchedule, previewDay]);

    const timeSlots = generateTimeSlots();

    const handleDayToggle = (dayValue) => {
        setRecurringSchedule(prev => ({
            ...prev,
            days: prev.days.includes(dayValue)
                ? prev.days.filter(d => d !== dayValue)
                : [...prev.days, dayValue]
        }));
    };

    const handleTypeToggle = (type) => {
        setRecurringSchedule(prev => ({
            ...prev,
            types: prev.types.includes(type)
                ? prev.types.filter(t => t !== type)
                : [...prev.types, type]
        }));
    };

    const handleAddBreak = () => {
        if (!newBreak.start || !newBreak.end || !newBreak.label) {
            toast.error('Please fill in all break time details');
            return;
        }
        // Enforce minimum 1 hour duration
        const [startHour, startMinute] = newBreak.start.split(":").map(Number);
        const [endHour, endMinute] = newBreak.end.split(":").map(Number);
        const duration = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
        if (duration < 60 || duration % 60 !== 0) {
            toast.error('Break must be at least 1 hour and in 1 hour increments');
            return;
        }
        setRecurringSchedule(prev => ({
            ...prev,
            breaks: [...(prev.breaks || []), { ...newBreak }]
        }));
        setNewBreak({ start: '', end: '', label: '' });
        setIsAddingBreak(false);
        toast.success('Break time added successfully');
    };

    const handleRemoveBreak = (idx) => {
        setRecurringSchedule(prev => ({
            ...prev,
            breaks: prev.breaks.filter((_, i) => i !== idx)
        }));
    };

    const handleEditSchedule = (schedule) => {
        setSelectedSchedule(schedule);
        setRecurringSchedule({
            ...schedule,
            name: schedule.name || '',
            startDate: schedule.startDate.split('T')[0],
            endDate: schedule.endDate ? schedule.endDate.split('T')[0] : null
        });
        setIsEditing(true);
        setActiveTab('new');
    };

    const handleSave = async () => {
        if (!recurringSchedule.name.trim()) {
            toast.error('Please provide a schedule name');
            return;
        }

        if (recurringSchedule.days.length === 0) {
            toast.error('Please select at least one day');
            return;
        }

        if (!recurringSchedule.startTime || !recurringSchedule.endTime) {
            toast.error('Please set both start and end times');
            return;
        }

        if (recurringSchedule.types.length === 0) {
            toast.error('Please select at least one appointment type');
            return;
        }

        // Remove icon property from breaks before sending
        const breaksToSend = (recurringSchedule.breaks || []).map(({ start, end, label }) => ({ start, end, label }));
        const scheduleToSend = { ...recurringSchedule, breaks: breaksToSend };

        try {
            if (isEditing && selectedSchedule) {
                await updateRecurringSchedule(selectedSchedule._id, scheduleToSend);
                toast.success('Schedule updated successfully');
            } else {
                await saveRecurringAvailability(scheduleToSend);
                toast.success('New schedule created successfully');
            }

            setRecurringSchedule(emptySchedule);
            setIsEditing(false);
            setSelectedSchedule(null);
            setActiveTab('existing');
            fetchRecurringSchedules();
        } catch (error) {
            toast.error('Failed to save schedule');
        }
    };

    const handleCancel = () => {
        setRecurringSchedule(emptySchedule);
        setIsEditing(false);
        setSelectedSchedule(null);
        setActiveTab('existing');
    };

    const formatTime = (time) => {
        return time.replace(/:00$/, '');
    };

    const getDayNames = (days) => {
        const dayMap = {
            0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat'
        };
        return days.map(d => dayMap[d]).join(', ');
    };

    const handleSlotSelect = (time, type) => {
        setSelectedSlots(prev => {
            const newSlots = { ...prev };
            if (!newSlots[time]) {
                newSlots[time] = [];
            }

            if (newSlots[time].includes(type)) {
                newSlots[time] = newSlots[time].filter(t => t !== type);
            } else {
                newSlots[time] = [...newSlots[time], type];
            }

            if (newSlots[time].length === 0) {
                delete newSlots[time];
            }

            return newSlots;
        });
    };

    const handleClearSchedule = () => {
        setSelectedSlots({});
    };

    const handleSaveSelectedSchedule = async () => {
        if (!selectedSchedule.date) {
            toast.error('Please select a date first');
            return;
        }

        try {
            await saveRecurringAvailability({
                [selectedSchedule.date]: selectedSlots
            });
            toast.success('Schedule saved successfully');
        } catch (error) {
            toast.error('Failed to save schedule');
        }
    };

    const handleBreakUpdate = (index, field, value) => {
        setRecurringSchedule(prev => {
            const updatedBreaks = [...prev.breaks];
            updatedBreaks[index] = {
                ...updatedBreaks[index],
                [field]: value
            };
            return {
                ...prev,
                breaks: updatedBreaks
            };
        });
    };

    const resetToDefaultBreaks = () => {
        setRecurringSchedule(prev => ({
            ...prev,
            breaks: defaultBreaks
        }));
        toast.success('Reset to system defaults');
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-light-gray to-white py-8 px-2">
            <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 h-max">
                {/* Tab Bar */}
                <div className="mb-2">
                    <div className="flex gap-2 border-b border-gray-200">
                        <button
                            className={`px-3 py-2 text-sm font-semibold transition-all focus:outline-none border-b-2 ${activeTab === 'existing'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-700 hover:text-primary'} bg-transparent`}
                            style={{ borderRadius: 0, boxShadow: 'none' }}
                            onClick={() => setActiveTab('existing')}
                        >
                            Recurring Schedules
                        </button>
                        <button
                            className={`px-3 py-2 text-sm font-semibold transition-all focus:outline-none border-b-2 ${activeTab === 'new'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-700 hover:text-primary'} bg-transparent`}
                            style={{ borderRadius: 0, boxShadow: 'none' }}
                            onClick={() => {
                                setActiveTab('new');
                                setRecurringSchedule(emptySchedule);
                                setIsEditing(false);
                                setSelectedSchedule(null);
                            }}
                        >
                            + New Schedule
                        </button>
                    </div>
                </div>
                {/* Tab Content */}
                {activeTab === 'existing' && (
                    <div className="w-full flex flex-col bg-transparent p-0 h-full min-h-0">
                        <div className="flex-1 min-h-0 overflow-y-auto">
                            {recurringSchedules.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <CalendarDays className="w-12 h-12 mb-2" />
                                    <p>No recurring schedules yet.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-6">
                                    {recurringSchedules.map((schedule, index) => (
                                        <div
                                            key={index}
                                            className="bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative"
                                        >
                                            {/* Left: Name and Days */}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-primary text-xl pl-2 mb-4 break-words">{schedule.name || `Schedule ${index + 1}`}</div>
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {getDayNames(schedule.days).split(', ').map((day) => (
                                                        <span
                                                            key={day}
                                                            className="bg-slate-100 text-gray-800 text-xs px-3 py-1 rounded-full font-medium shadow-sm"
                                                        >
                                                            {day}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            {/* Right: Details row */}
                                            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 flex-shrink-0 w-full md:w-auto">
                                                {/* Time */}
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <Clock className="w-4 h-4 text-gray-500" />
                                                    <span className="font-medium">{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</span>
                                                </div>
                                                {/* Date Range */}
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <Calendar className="w-4 h-4 text-gray-500" />
                                                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-800">
                                                        {schedule.startDate.split('T')[0]} → {schedule.endDate ? schedule.endDate.split('T')[0] : 'Ongoing'}
                                                    </span>
                                                </div>
                                                {/* Breaks */}
                                                <div className="flex items-center min-w-[90px] justify-center md:justify-start">
                                                    <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">
                                                        {schedule.breaks.length} {schedule.breaks.length === 1 ? 'break' : 'breaks'}
                                                    </span>
                                                </div>
                                                {/* Actions */}
                                                <div className="flex items-center gap-2 justify-center md:justify-end min-w-[90px]">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditSchedule(schedule);
                                                        }}
                                                        className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteRecurringSchedule(schedule._id);
                                                        }}
                                                        className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition"
                                                        title="Delete"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {activeTab === 'new' && (
                    // Form Panel
                    <div className="w-full flex flex-col bg-transparent px-0 py-0 h-full min-h-0">
                        <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                            <Repeat className="w-7 h-7" /> {isEditing ? 'Edit Recurring Schedule' : 'Create Recurring Schedule'}
                        </h2>
                        <div className="flex-1 min-h-0 overflow-y-auto pr-2 space-y-10">
                            {/* Schedule Name */}
                            <section>
                                <label className="block text-lg font-semibold text-gray-700 mb-2">Schedule Name</label>
                                <input
                                    type="text"
                                    value={recurringSchedule.name}
                                    onChange={e => setRecurringSchedule(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., Morning Sessions, Friday Evenings"
                                    className="w-full p-3 border rounded-xl text-base focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 mb-2"
                                />
                            </section>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Days */}
                                <section>
                                    <h3 className="font-semibold mb-3 text-lg">Days</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {daysOfWeek.map(day => (
                                            <button
                                                key={day.value}
                                                onClick={() => handleDayToggle(day.value)}
                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${recurringSchedule.days.includes(day.value)
                                                    ? 'bg-primary text-white shadow'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                            >
                                                {day.label}
                                            </button>
                                        ))}
                                    </div>
                                </section>
                                {/* Time Range & Interval */}
                                <section>
                                    <h3 className="font-semibold mb-3 text-lg">Time Range</h3>
                                    <div className="flex gap-2 mb-3">
                                        {["startTime", "endTime"].map((field, idx) => (
                                            <select
                                                key={field}
                                                value={recurringSchedule[field]}
                                                onChange={e => setRecurringSchedule(prev => ({ ...prev, [field]: e.target.value }))}
                                                className="p-2 border rounded-lg w-1/2"
                                            >
                                                {Array.from({ length: 13 }, (_, i) => 9 + i).map(hour => {
                                                    const time = `${hour.toString().padStart(2, '0')}:00`;
                                                    return <option key={time} value={time}>{time}</option>;
                                                })}
                                            </select>
                                        ))}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Session Interval</label>
                                        <select
                                            value={recurringSchedule.interval}
                                            onChange={e => setRecurringSchedule(prev => ({ ...prev, interval: parseInt(e.target.value) }))}
                                            className="w-full p-2 border rounded-lg"
                                        >
                                            <option value={60}>60 mins (40 min session + 20 min break)</option>
                                            <option value={120}>120 mins (100 min session + 20 min break)</option>
                                        </select>
                                    </div>
                                </section>
                                {/* Types */}
                                <section>
                                    <h3 className="font-semibold mb-3 text-lg">Appointment Types</h3>
                                    <div className="flex gap-2">
                                        {["In-Person", "Online"].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => handleTypeToggle(type)}
                                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${recurringSchedule.types.includes(type)
                                                    ? 'bg-primary text-white shadow'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </section>
                                {/* Date Range */}
                                <section>
                                    <h3 className="font-semibold mb-3 text-lg">Date Range</h3>
                                    <div className="flex gap-2">
                                        <input
                                            type="date"
                                            value={recurringSchedule.startDate}
                                            onChange={e => setRecurringSchedule(prev => ({ ...prev, startDate: e.target.value }))}
                                            className="p-2 border rounded-lg w-1/2"
                                        />
                                        <input
                                            type="date"
                                            value={recurringSchedule.endDate || ''}
                                            onChange={e => setRecurringSchedule(prev => ({ ...prev, endDate: e.target.value || null }))}
                                            className="p-2 border rounded-lg w-1/2"
                                        />
                                    </div>
                                </section>
                                {/* Breaks */}
                                <section className="md:col-span-2 bg-gray-50 rounded-xl p-6 shadow-inner mt-2">
                                    <h3 className="font-semibold mb-3 text-lg flex items-center gap-2"><Coffee className="w-5 h-5" /> Break Times</h3>
                                    <div className="flex gap-2 mb-3">
                                        <button
                                            onClick={() => setIsAddingBreak(!isAddingBreak)}
                                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center"
                                        >
                                            {isAddingBreak ? 'Cancel' : 'Add Break'}
                                        </button>
                                        <button
                                            onClick={resetToDefaultBreaks}
                                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
                                        >
                                            Reset to System Defaults
                                        </button>
                                    </div>
                                    {isAddingBreak && (
                                        <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                                    <input
                                                        type="time"
                                                        value={newBreak.start}
                                                        onChange={e => setNewBreak(prev => ({ ...prev, start: e.target.value }))}
                                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                                    <input
                                                        type="time"
                                                        value={newBreak.end}
                                                        onChange={e => setNewBreak(prev => ({ ...prev, end: e.target.value }))}
                                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Break Label</label>
                                                    <input
                                                        type="text"
                                                        value={newBreak.label}
                                                        onChange={e => setNewBreak(prev => ({ ...prev, label: e.target.value }))}
                                                        placeholder="e.g., Lunch Break"
                                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    />
                                                </div>
                                            </div>
                                            <div className="mt-4 flex justify-end">
                                                <button
                                                    onClick={handleAddBreak}
                                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center"
                                                >
                                                    <Check className="w-4 h-4 mr-2" /> Add Break
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {recurringSchedule.breaks.map((breakTime, index) => (
                                            <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-primary transition-colors">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-2">
                                                        {breakTime.icon}
                                                        <span className="font-medium text-gray-800">{breakTime.label}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveBreak(index)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{formatTime(breakTime.start)} - {formatTime(breakTime.end)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                            {/* Live Preview */}
                            <section className="mt-10 bg-gray-50 p-6 rounded-2xl shadow-inner max-h-56 overflow-y-auto">
                                <h3 className="text-lg font-semibold mb-3">Generated Slots Preview</h3>
                                <div className="mb-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Day to Preview</label>
                                    <select
                                        value={previewDay}
                                        onChange={e => setPreviewDay(parseInt(e.target.value))}
                                        className="w-full max-w-xs p-2 border rounded-lg"
                                    >
                                        {daysOfWeek.map(day => (
                                            <option
                                                key={day.value}
                                                value={day.value}
                                                disabled={!recurringSchedule.days.includes(day.value)}
                                            >
                                                {day.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {recurringSchedule.days.includes(previewDay) ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {generatedSlots.map((slot, index) => (
                                            <div
                                                key={index}
                                                className="p-2 bg-white rounded-lg border border-gray-200 text-center"
                                            >
                                                <div className="font-medium text-gray-800">{slot.time}</div>
                                                <div className="text-xs text-gray-600 mt-1">
                                                    {slot.types.join(' / ')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">
                                        Select this day in the schedule to see available slots
                                    </p>
                                )}
                            </section>
                        </div>
                        {/* Sticky Save/Cancel Bar */}
                        <div className="sticky bottom-0 left-0 z-30 flex justify-center bg-white w-full pt-4 pb-2 mt-2 border-t border-gray-200 shadow">
                            <button
                                onClick={handleCancel}
                                className="px-8 py-3 rounded-xl text-lg font-semibold border border-gray-300 hover:bg-gray-100 transition-all mr-4"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={recurringSchedule.days.length === 0}
                                className={`px-8 py-3 rounded-xl text-lg font-semibold transition-all ${recurringSchedule.days.length === 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-primary text-white hover:bg-primary-dark'
                                    }`}
                            >
                                {isEditing ? 'Update Schedule' : 'Save Schedule'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecurringSchedule; 